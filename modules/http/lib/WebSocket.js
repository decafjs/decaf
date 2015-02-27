"use strict";

/**
 * @fileoverview WebSocket implementation
 */

/*global require, java, sync, exports */
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
    var me = this;

    res.status = 101;
    decaf.extend(res.headers, {
        'Upgrade'              : 'websocket',
        'Connection'           : 'upgrade',
        'Sec-WebSocket-Accept' : makeAccept(req.headers['sec-websocket-key']) // base64_encode(buf)
    });
    res.sendHeaders();
    res.flush();

    me.req = req;
    me.res = res;

    me.uuid = uuid();

    // this assures only one thread at a time can be in a WebSocket's
    // send method.
    me.send = sync(function (s) {
        me.rawSendMessage(s);
    }, me);
    me.ping = sync(function () {
        me.rawSendPing();
    }, this);
    me.pong = sync(function () {
        me.rawSendPong();
    }, me);
    me.onmessage = me.onclose = function () {};
}

decaf.extend(WebSocket.prototype, decaf.observable);

decaf.extend(WebSocket.prototype, {
    /**
     * Broadcast a message to all sockets with the specified path (ws URI)
     *
     * The message sent is a string.  Caller may send JSON encoded objects
     * to the client, and the client should know to decode the object.
     *
     * @param {string} path WebSocket path
     * @param {string} message message to send
     */
    broadcast      : function (path, message) {
        var me = this;
        new Thread(function () {
            decaf.each(webSockets, function (ws) {
                if (ws.uuid !== me.uuid && ws.req.uri === path) {
                    ws.send(message);
                }
            });
        }).start();
    },
    run            : function () {
        var me = this,
            is = this.req.is,
            message;

        is.socket.setSoTimeout(0);

        webSockets[this.uuid] = this;

        // child thread blocks reading message

        try {
            while ((message = me.getMessage(is)) !== false) {
                try {
                    me.onmessage(message);
                    me.fire('message', message);
                }
                catch (e) {
                    if (e === 'EOF') {
                        throw e;
                    }
                    console.dir(e);
                }
            }
        }
        finally {
            try {
                me.onclose();
                me.fire('close');
            }
            finally {
                delete webSockets[me.uuid];
            }
        }
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
    getMessage  : function (is) {
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
    },
    close: function() {
        this.is.eof = true;
    }

});

decaf.extend(exports, {
    WebSocket : WebSocket
});
