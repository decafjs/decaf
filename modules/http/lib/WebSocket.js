"use strict";

/**
 * @fileoverview WebSocket implementation
 */

/*global require, java, sync */
var GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
    {Thread} = require('Threads');

function sha1 (str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: utf8_encode
    // *     example 1: sha1('Kevin van Zonneveld');
    // *     returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
    var rotate_left = function (n, s) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };

    /*var lsb_hex = function (val) { // Not in use; needed?
     var str="";
     var i;
     var vh;
     var vl;

     for ( i=0; i<=6; i+=2 ) {
     vh = (val>>>(i*4+4))&0x0f;
     vl = (val>>>(i*4))&0x0f;
     str += vh.toString(16) + vl.toString(16);
     }
     return str;
     };*/

    var cvt_hex = function (val) {
        var str = "";
        var i;
        var v;

        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };

    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;

    str = utf8_encode(str);
    var str_len = str.length;

    var word_array = [];
    for (i = 0; i < str_len - 3; i += 4) {
        j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (str_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
            break;
    }

    word_array.push(i);

    while ((word_array.length % 16) != 14) {
        word_array.push(0);
    }

    word_array.push(str_len >>> 29);
    word_array.push((str_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) {
            W[i] = word_array[blockstart + i];
        }
        for (i = 16; i <= 79; i++) {
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }


        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    return temp.toLowerCase();
}

function base64_encode (data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Bayron Guevara
    // +   improved by: Thunder.m
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Rafał Kukawski (http://kukawski.pl)
    // *     example 1: base64_encode('Kevin van Zonneveld');
    // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['btoa'] == 'function') {
    //    return btoa(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = "",
        tmp_arr = [];

    if (!data) {
        return data;
    }

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    var r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

}

function uuid() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}


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
        'Upgrade'             : 'websocket',
        'Connection'          : 'upgrade',
        'Sec-WebSocket-Accept': makeAccept(req.headers['sec-websocket-key']) // base64_encode(buf)
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
    on: function (eventName, handler) {
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
    fireEvent: function (eventName, data) {
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
    broadcast: function (path, message) {
        var me = this;
        new Thread(function () {
            decaf.each(webSockets, function (ws) {
                if (ws.uuid !== me.uuid && ws.req.uri === path) {
                    ws.sendMessage(message);
                }
            });
        }).start();
    },

    run: function () {
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

    rawSendMessage: function (s) {
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

    rawSendPing: function () {
        var os = this.res.os.socket.getOutputStream();
        os.write(0x89);
        os.write(0);
    },

    rawSendPong: function () {
        var os = this.res.os.socket.getOutputStream();
        os.write(0x8a);
        os.write(0);
    },

    getMessage: function (is) {
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
                        break;
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
    WebSocket: WebSocket
});
