"use strict";

/**
 * @fileoverview WebSocket implementation
 */

/*global require, java, sync */
var GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
    {Thread} = require('Threads'),
    {sha1, base64_encode, uuid} = require('support');


function makeAccept(key) {
    var hex = sha1(key + GUID);
    var buf = '';

    // convert ASCII sha1 hex to binary
    while (hex.length) {
        buf += String.fromCharCode(parseInt(hex.substr(0, 2), 16));
        hex = hex.substr(2);
    }
    buf = base64_encode(buf);
    return buf;
}

var webSockets = {};

/**
 * Construct a new WebSocket.
 *
 * This constructor is typically not called by applications.  It is instantiated by
 * http.Child when an upgrade request is received.
 *
 * The instantiated WebSocket object may well be manipulated (see member methods below)
 * by application code.
 *
 * @param {Request} req http.Request for the current Child Thread
 * @param {Response} res http.Response for the current Child Thread
 * @constructor
 */
function WebSocket(req, res) {
    res.status = 101;
    decaf.extend(res.headers, {
        'Upgrade'              : 'websocket',
        'Connection'           : 'upgrade',
        'Sec-WebSocket-Accept' : makeAccept(req.headers['sec-websocket-key']) // base64_encode(buf)
    });
    res.sendHeaders();
    res.flush();

    this.req = req;
    this.res = res;

    this.handlers = {};
    this.uuid = uuid();

    // this assures only one thread at a time can be in a WebSocket's
    // sendMessage method.
    this.sendMessage = sync(function (s) {
        this.rawSendMessage(s);
    }, this);
    this.ping = sync(function () {
        this.rawSendPing();
    }, this);
    this.pong = sync(function () {
        this.rawSendPong();
    }, this);
}

decaf.extend(WebSocket.prototype, {
    /**
     * Register a handler to be called when an event is fired on this socket.
     *
     * There is one defined event currently, "message" that allows applications
     * to have an event handler called when a message is received over the Socket.
     *
     * Applications can listen on any arbitrary events as well, since the eventName
     * is any string, and there is a fireEvent() method that the applicaiton can call.
     *
     * For example, the application might listen for message events, and when a
     * "quit chat room" message received, fire a "quit chat room" event.
     *
     * @param {string} eventName name of event
     * @param {function} handler function to call when event is fired
     */
    on : function (eventName, handler) {
        this.handlers[eventName] = this.handlers[eventName] || [];
        this.handlers[eventName].push(handler);
    },

    /**
     * Fire an event by name.
     *
     * THe data argument can be any arbitrary thing.  It is passed to the
     * event handler untouched.
     *
     * @param {string} eventName name/kind of event to fire
     * @param {object} data arbitrary data passed to event handlers
     */
    fireEvent : function (eventName, data) {
        var handlers = this.handlers[eventName];
        if (handlers) {
            decaf.each(handlers, function (handler) {
                handler(data);
            });
        }
    },

    /**
     * Broadcast a message to all sockets with the specified path (ws URI)
     *
     * The message sent is a string.  Caller may send JSON encoded objects
     * to the client, and the client should know to decode the object.
     *
     * @param {string} path WebSocket path
     * @param {string} message message to send
     */
    broadcast : function (path, message) {
        var me = this;
        new Thread(function () {
            decaf.each(webSockets, function (ws) {
                if (ws.uuid !== me.uuid && ws.req.uri === path) {
                    ws.sendMessage(message);
                }
            });
        }).start();
    },

    run : function () {
        var is = this.req.is,
            message;

        is.socket.setSoTimeout(0);

        webSockets[this.uuid] = this;

        // child thread blocks reading message
        while ((message = this.getMessage(is)) !== false) {
            this.fireEvent('message', message);
        }
        this.fireEvent('close');
        delete webSockets[this.uuid];
    },

    rawSendMessage : function (s) {
        var os = this.res.os.socket.getOutputStream(),
            len = s.length;

        os.write(0x81);
        if (len < 126) {
            os.write(len);
        }
        else if (len < 65536) {
            os.write(0x7e);
            os.write((len >> 8) & 0xff);
            os.write(len & 0xff);
        }
        else {
            os.write(0x7f);
            os.write((len >> 56) & 0xff);
            os.write((len >> 48) & 0xff);
            os.write((len >> 40) & 0xff);
            os.write((len >> 32) & 0xff);
            os.write((len >> 24) & 0xff);
            os.write((len >> 16) & 0xff);
            os.write((len >> 8) & 0xff);
            os.write((len >> 0) & 0xff);
        }
        os.write(decaf.toJavaByteArray(s));
        os.flush();
    },

    rawSendPing : function () {
        var os = this.res.os.socket.getOutputStream();
        os.write(0x89);
        os.write(0);
    },

    rawSendPong : function () {
        var os = this.res.os.socket.getOutputStream();
        os.write(0x8a);
        os.write(0);
    },

    getMessage : function (is) {
        function next() {
            return is.readByte();
        }

        var message = '',
            fin = false;

        try {
            while (!fin) {
                var opCode = next();

                fin = !!(opCode & 0x80);
                opCode &= 0x7f;
                switch (opCode) {
                    case 0x0:       // continuation frame
                        break;
                    case 0x1:       // text frame
                        break;
                    case 0x2:       // binary frame
                        break;
                    case 0x8:       // close
                        return false;
                    case 0x9:       // ping
                        this.pong();
                        break;
                    case 0xa:       // pong
                        break;
                    default:        // reserved
                        break;
                }

                var len = next(),
                    mask = (len & 0x80) ? [] : null,
                    i,
                    ndx = 0;

                len = len & 0x7f;
                if (len === 0x7e) {
                    len = (next() << 8) | next();
                }
                else if (len === 0x7f) {
                    len = 0;
                    for (i = 0; i < 8; i++) {
                        len = len << 8;
                        len |= next();
                    }
                }
                if (mask) {
                    mask.push(next());
                    mask.push(next());
                    mask.push(next());
                    mask.push(next());
                    for (i = 0; i < len; i++) {
                        message += String.fromCharCode(next() ^ mask[ndx++]);
                        ndx %= 4;
                    }
                }
                else {
                    // should never happen - client MUST mask
                    for (i = 0; i < len; i++) {
                        message += String.fromCharCode(next());
                        ndx %= 4;
                    }
                }
                if (len === 0) {
                    fin = false;
                }
            }
            return message;
        }
        catch (e) {
//                if (e.dumpText()) {
//                    e.dumpText();
//                }
//                else {
//                    console.log(e);
//                }
            return false;
        }
    }

});

decaf.extend(exports, {
    WebSocket : WebSocket
});
