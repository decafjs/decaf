/**
 * @module http
 * @submodule Server
 */
/*global require, java, io */
"use strict";

global.io = global.io || 'net';

var Child = require('Child').Child,
    Thread = require('Threads').Thread,
    Socket = require(io).Socket,
    process = require('process');

/**
 * @constructor
 *
 * @param fn
 */
function Server(fn) {
    this.fn = fn;
    this.webSockets = {};
}
decaf.extend(Server.prototype, {
    /**
     * @memberOf http.Server
     * @method listen
     * @param port
     * @param bindAddress
     * @param numChildren
     * @return {*}
     */
    listen   : function (port, bindAddress, numChildren) {
        numChildren = numChildren || 50;
        try {
            var serverSocket = new Socket();
            serverSocket.listen(port, bindAddress, 100);
        }
        catch (e) {
            java.lang.System.out.println(e.toString());
            process.exit(1);
        }
        for (var i = 0; i < numChildren; i++) {
            new Thread(Child, serverSocket, this).start();
        }
        return this;
    },
    /**
     * @memberOf http.Server
     * @method webSocket
     * @param path
     * @param onConnect
     * @return {*}
     */
    webSocket: function (path, onConnect) {
        this.webSockets[path] = onConnect;
        return this;
    }
});

/**
 * @method createServer
 *
 * @param {Function} fn function to handle requests
 * @return {Server}
 */
function createServer(fn) {
    return new Server(fn);
}


decaf.extend(exports, {
    createServer: createServer
});
