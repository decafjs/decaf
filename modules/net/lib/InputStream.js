/** @module InputStream */

/*global java, decaf */

"use strict";

/**
 *
 * @param socket
 * @constructor
 */
function InputStream(socket) {
    this.socket = socket;
    this.serverPort = socket.serverPort;
    socket.setSoTimeout(5000);
    // java.io.BufferedReader(new java.io.InputStreamReader(socket.getInputStream()));
    this.buffer = new java.io.BufferedInputStream(socket.getInputStream());
    this.is = new java.io.DataInputStream(this.buffer);
    this.eof = false;
}

decaf.extend(InputStream.prototype, {
    /**
     *
     * @returns {string}
     */
    remoteAddress: function () {
        return this.socket.getRemoteSocketAddress();
    },

    /**
     *
     */
    destroy: function () {
        this.buffer.close();
        this.is.close();
    },

    /**
     *
     * @returns {*}
     */
    readByte: function () {
        return this.is.readUnsignedByte();
    },

    /**
     *
     * @param length
     * @returns {*}
     */
    read: function (length) {
        if (this.eof) {
            throw 'EOF';
        }
        try {
            if (length) {
                var ba = new java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, length),
                    remaining = length,
                    offset = 0,
                    actual;

                while (remaining > 0) {
                    actual = this.is.read(ba, offset, remaining);
                    if (actual === -1) {
                        throw 'EOF';
                    }
                    offset += actual;
                    remaining -= actual;

                }
                return ba;
            }
            else {
                return this.is.readUnsignedByte();
            }
        }
        catch (e) {
            throw 'EOF';
        }
    },

    /**
     *
     * @returns {*}
     */
    readLine: function () {
        var s;
        try {
            s = this.is.readLine();
        }
        catch (e) {
            throw 'EOF';
        }
        if (s === null) {
            throw 'EOF';
        }
        return String(s);
    }
});

exports.InputStream = InputStream;
