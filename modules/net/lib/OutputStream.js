/** @module OutputStream */

/*global java, exports, decaf */
"use strict";

/**
 *
 * @param socket
 * @constructor
 */
function OutputStream(socket) {
    this.socket = socket;
    socket.setTcpNoDelay(true);
    socket.setSendBufferSize(16384);
    this.os = new java.io.PrintWriter(socket.getOutputStream()); // new java.io.BufferedOutputStream(socket.getOutputStream(), 16384);
}

decaf.extend(OutputStream.prototype, {
    /**
     *
     */
    destroy: function () {
        this.os.flush();
        this.os.close();
    },

    /**
     *
     * @param s
     */
    writeln: function (s) {
        this.os.print(s + '\r\n');
    },

    /**
     *
     * @param s
     */
    write: function (s) {
        this.os.print(s);
    },

    /**
     *
     * @param bytes
     * @param offset
     * @param length
     * @returns {*}
     */
    writeBytes: function (bytes, offset, length) {
        var os = this.socket.getOutputStream();
        var written = os.write(bytes, offset, length);
        return written;
    },

    /**
     *
     */
    flush: function () {
        this.os.flush();
    }
});

exports.OutputStream = OutputStream;
