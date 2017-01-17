/*global require, java, io */
"use strict";

global.io = global.io || 'net';

var Child = require('Child').Child,
    Thread = require('Threads').Thread,
    Socket = require(io).Socket,
    process = require('process');

/**
 * @class http.Server
 * A class for serving http requests.
 *
 * ## Example:
 *
 * ```javascript
 * var http = require('http');
 *
 *  http.createServer(function(req, res) {
 *     res.writeHead(200, { 'Content-Type': 'text/plain'});
 *     res.end('Hello World\n');
 * }).listen(1337, '127.0.0.1', 50);
 * console.log('Server running at http://127.0.0.1:1337/');
 ```
 * @constructor
 * @private
 * Create an instance of an http server.  The specified function is passed a Request and Response as arguments for each request.
 *
 * @param {Function} fn  function to call for each request
 */
function Server(fn) {
    this.fn = fn;
    this.webSockets = {};
}
decaf.extend(Server.prototype, {
    /**
     * @param port
     * @param bindAddress
     * @param numChildren
     * @param uploadMaxSize
     * @param uploadBlocksize
     * @param uploadDir
     * @return {*}
     */
    listen   : function (port, bindAddress, numChildren, uploadMaxSize, uploadBlocksize, uploadDir) {
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
            new Thread(Child, serverSocket, this, uploadMaxSize, uploadBlocksize, uploadDir).start();
        }
        return this;
    },
    /**
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
 * @static
 *
 * @param {Function} fn function to handle requests
 * @return {http.Server}
 */
function createServer(fn) {
    return new Server(fn);
}


decaf.extend(exports, {
    createServer: createServer
});
