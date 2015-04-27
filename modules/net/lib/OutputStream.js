/*global java, exports, decaf */
"use strict";

/**
 * @class net.OutputStream
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
        var os = this.os;

        os.print(s + '\r\n');
        if (os.checkError()) {
            throw 'EOF';
        }
    },

    /**
     *
     * @param s
     */
    write: function (s) {
        var os = this.os;

        os.print(s);
        if (os.checkError()) {
            throw 'EOF';
        }
    },

    /**
     *
     * @param bytes
     * @param offset
     * @param length
     */
    writeBytes: function (bytes, offset, length) {
        // NOTE OutputStream.write() returns void
        var os = this.socket.getOutputStream();
        os.write(bytes, offset, length);
    },

    /**
     *
     */
    flush: function () {
        var os = this.os;

        os.flush();
        if (os.checkError()) {
            throw 'EOF';
        }
    }
});

exports.OutputStream = OutputStream;
