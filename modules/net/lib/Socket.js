/**
 * @class net.Socket
 * Server socket impelmentation.
 */

"use strict";

/*global java, decaf, exports */
var ServerSocket = java.net.ServerSocket,
    InetAddress = java.net.InetAddress;

/**
 * @method Socket
 * @param socket
 * @param remote_addr
 * @constructor
 */
function Socket(socket, remote_addr) {
    if (socket) {
        this.socket = socket;
        this.remote_addr = remote_addr;
    }
    else {
        this.socket = null;
    }
}
decaf.extend(Socket.prototype, {
    /**
     *
     * @returns {*}
     */
    getChannel: function () {
        return this.socket.getChannel();
    },

    /**
     *
     * @returns {string}
     */
    getRemoteSocketAddress: function () {
        return String(this.socket.getRemoteSocketAddress().getAddress()).replace(/^\//, '');
    },

    /**
     *
     * @returns {*}
     */
    getInputStream: function () {
        return this.socket.getInputStream();
    },

    /**
     *
     * @returns {*}
     */
    getOutputStream: function () {
        return this.socket.getOutputStream();
    },

    /**
     *
     * @param flag
     * @returns {*}
     */
    setTcpNoDelay: function (flag) {
        return this.socket.setTcpNoDelay(flag);
    },

    /**
     *
     * @param size
     * @returns {*}
     */
    setSendBufferSize: function (size) {
        return this.socket.setSendBufferSize(size);
    },

    /**
     *
     * @param timeout
     * @returns {*}
     */
    setSoTimeout: function (timeout) {
        return this.socket.setSoTimeout(timeout);
    },

    /**
     *
     */
    destroy: function () {
        // close server socket if one
        if (this.socket) {
            this.socket.close();
            delete this.socket;
        }
    },

    /**
     *
     * @param port
     * @param listenAddress
     * @param backlog
     * @returns {number}
     */
    listen: function (port, listenAddress, backlog) {
        this.socket = new ServerSocket(port, backlog, InetAddress.getByName(listenAddress));
        this.socket.setReuseAddress(true);
        this.port = port;
        return 0;
    },

    /**
     *
     * @returns {*}
     */
    accept: function () {
        var socket;
        try {
            socket = this.socket.accept();
//                socket.setSoLinger(false, 0);
            socket = new Socket(socket, socket.getRemoteSocketAddress());
            socket.serverPort = this.port;
        }
        catch (e) {
            console.log(e.toString());
            throw e;
        }
        return socket;
    }
});

exports.Socket = Socket;
