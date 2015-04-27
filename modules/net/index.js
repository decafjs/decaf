"use strict";

/**
 * Buffered sockets for network programming.
 *
 * @class net
 * @singleton
 */
/*global exports, require, decaf */
decaf.extend(exports, {
    Socket      : require('lib/Socket').Socket,
    InputStream : require('lib/InputStream').InputStream,
    OutputStream: require('lib/OutputStream').OutputStream
});
