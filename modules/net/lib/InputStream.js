/*global java, decaf */

"use strict";
/**
 * @class net.InputStream
 * Buffered input from sockets.
 *
 * InputStreams are used by the http module to communicate with the client/browser.
 */

/**
 * @method InputStream
 * @constructor
 * Construct a buffered input stream from a raw socket.
 *
 * @param {java.io.Socket} socket java.io.Socket to use as input stream.
 *
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
     * Get remote address of socket connection
     * @returns {String} IP address of other end of the socket connection.
     */
    remoteAddress : function () {
        return this.socket.getRemoteSocketAddress();
    },
    /**
     * Close Stream and free any resources in use.
     */
    destroy       : function () {
        this.buffer.close();
        this.is.close();
    },
    /**
     * Read a byte from the input stream.
     * @returns {Number} unsigned byte read from the input stream.
     */
    readByte      : function () {
        return this.is.readUnsignedByte();
    },
    /**
     * Read bytes from the input stream.
     *
     * @param {Number} length number of bytes to read
     * @returns {Array.<Number>} Java byte array of bytes read in.
     * @throws {String} EOF if there are no more data to read from the stream.
     */
    read          : function (length) {
        if (this.eof) {
            throw 'EOF';
        }
        try {
            if (length) {
                var ba        = new java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, length),
                    remaining = length,
                    offset    = 0,
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
     * Read in a line from the input stream.
     *
     * @returns {String} the line read in
     * @throws {String} EOF if there are no more data to read from the stream.
     */
    readLine      : function () {
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
    },
    /**
     * Mark the current position of the stream to be able to return to it with a later call to reset()
     * @param {Number} readahead: the number of bytes that can be read before tha mark is invalidated
     *
     * @returns nothing
     */
    mark          : function (readAhead) {
        this.is.mark(readAhead);
    },    
    /**
     * Reset the position of the stream to the last position marked by a call to mark()
     *
     * @returns nothing
     */
    reset         : function () {
        this.is.reset();
    }
  
});

exports.InputStream = InputStream;
