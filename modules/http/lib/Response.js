/*global require, exports, toString, decaf, java */

"use strict";

var mimeTypes = require('mimetypes').mimeTypes,
    GZIP = require('GZIP').GZIP;

/**
 * Hash containing HTTP status codes and the messages associated with them.
 */
var responseCodeText = {
    100: 'Continue',
    101: 'Switching Protocols',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required', // note RFC says reserved for future use
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Request Range Not Satisfiable',
    417: 'Expectation Failed',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not SUpported'
};

/**
 * Create an instance of an HTTP Response object.
 *
 * Response instances are typically automatically created by http.Child
 *
 * @param {OutputStream} os OutputStream to send response to
 * @param {string} proto 'GET' or 'POST' etc.
 * @constructor
 */
function Response(os, req) {
    this.os = os;
	this.req = req;
    this.headersSent = false;
    this.status = 200;
    this.contentLength = 0;
    this.cookies = null;
    this.headers = {};
    this.proto = this.req.proto;
}

decaf.extend(Response.prototype, {
    /**
     *
     */
    destroy: function () {
//            this.os.flush();
        this.os.destroy();
    },

    setCookie: function (key, value, expires, path, domain) {
        var cookie = {
            value: value
        };
        if (expires) {
            expires = toString.apply(expires) === '[object Date]' ? expires.toGMTString() : expires;
            cookie.expires = expires;
        }
        if (path) {
            cookie.path = path;
        }
        else {
            cookie.path = '/';
        }
        if (domain) {
            cookie.domain = domain;
        }
        this.cookies = this.cookies || {};
        this.cookies[key] = cookie;
    },

    unsetCookie: function (key) {
        var now = new Date().getTime() / 1000;
        var yesterday = now - 86400;
        this.cookies = this.cookies || {};
        var cookie = this.cookies[key] || {};
        cookie.path = cookie.path || '/';
        cookie.expires = new Date(yesterday * 1000).toGMTString();

        this.cookies[key] = cookie;
    },


    /**
     * Set response status and headers.
     *
     * @param {int} status HTTP status, e.g. 200 (for OK), 404 (not found), etc.
     * @param {object} headers hash containing headers to be added to the response headers.
     */
    writeHead: function (status, headers) {
        var me = this;

        decaf.extend(this.headers, headers);
        this.status = status;
    },

    /**
     * Send a response.
     *
     * This method is inspired by res.send() of ExpressJS.
     *
     * This method determines the type of the thing to be sent and pretty much does the
     * right thing.
     *
     * If the body to be sent is a string, the content-type header is set to text/html.
     *
     * If the body to be sent is an array or object, then the JSON representation will be sent
     * with content-type set to application/json.
     *
     * If the optional status code is not provided, then 200 is assumed.
     *
     * If the only argument is a number, it is assumed to be a status code and a response body
     * string is automatically sent (e.g. OK for 200, Not Found for 404, etc.)
     *
     * @param {int} status - optional HTTP status code (e.g. 200, 404, etc.)
     * @param {string|object|array|number} body - optional thing to be sent as the response
     */
    send: function (status, body) {
        if (typeof status === 'number') {
            if (body === undefined) {
                this.writeHead(status, { 'Content-Type': 'text/html'});
                this.end(responseCodeText[status] || ('Unknown status ' + status));
                return;
            }
        }
        else if (body === undefined) {
            body = status;
			status = this.status || 200;
        }

        if (typeof body === 'string') {
            this.writeHead(status, { 'Content-Type': 'text/html '});
            this.end(body);
        }
        else {
            this.writeHead(status, { 'Content-Type': 'application/json'});
            this.end(JSON.stringify(body));
        }
    },

    /**
     * Send a file to the client.
     *
     * @param {string} filename name of file to send
     * @param {boolean} modifiedSince false to disable 304 if-modified-since processing
     */
    sendFile: function (filename, modifiedSince) {
        var os = this.os,
            headers = this.headers,
            extension = filename.indexOf('.') !== -1 ? filename.substr(filename.lastIndexOf('.') + 1) : '',
            file = new java.io.File(filename),
            modified = file.lastModified(),
            size = file.length();

        if (modified === 0) {
            throw new Error('404');
        }

        headers['Content-Type'] = mimeTypes[extension] || 'text/plain';
        modified = parseInt(modified / 1000, 10);
        headers['last-modified'] = new Date(modified * 1000).toGMTString();

        if (modifiedSince) {
            if (typeof modifiedSince === 'string') {
                modifiedSince = Date.parse(modifiedSince) / 1000;
            }
            if (modified < modifiedSince) {
                this.status = 304;
                this.sendHeaders();
                return;
            }
        }

        try {
            var inFile = new java.io.FileInputStream(filename),
                buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096 * 16),
                remaining = size,
                offset = 0,
                actual;

            this.status = 200;
            headers['Content-Length'] = remaining;
            this.sendHeaders();
            os.flush();

            while (remaining > 0) {
                actual = inFile.read(buf);
                if (actual <= 0) {
                    break;
                }
                os.writeBytes(buf, 0, actual);
                offset += actual;
                remaining -= actual;
            }
            inFile.close();
            os.flush();
        }
        catch (e) {
            e.dumpText();
        }
    },

    /**
     * Send a Java byte[] array to the client.
     *
     * @param {byte[]} bytes array of bytes to send
     * @param {string} mimeType mime-type to send (content-type)
     * @param {int} lastModified timestamp byte array last modified
     * @param {string|int} modifiedSince if-modified-since request header value
     */
    sendBytes: function (bytes, mimeType, lastModified, modifiedSince) {
        var os = this.os,
            headers = this.headers,
            size = bytes.length;
        headers['Content-Type'] = mimeType;
        if (lastModified) {
            lastModified = parseInt(lastModified / 1000, 10);
            headers['last-modified'] = new Date(lastModified * 1000);
            if (modifiedSince) {
                if (typeof modifiedSince === 'string') {
                    modifiedSince = Date.parse(modifiedSince);
                }
                modifiedSince = parseInt(modifiedSince / 1000, 10);
                if (lastModified <= modifiedSince) {
                    this.status = 304;
                    this.sendHeaders();
                    this.flush();
                    return;
                }
            }
        }
        headers['Content-Length'] = size;
        this.sendHeaders();
        this.flush();

        var remaining = size,
            offset = 0,
            actual;

        while (remaining > 0) {
            actual = os.writeBytes(bytes, offset, remaining);
            offset += actual;
            remaining -= actual;
        }
        os.flush();
    },

    /**
     * Send response headers to the client.
     */
    sendHeaders: function () {
        var me = this,
            os = me.os,
            headers = me.headers;

        os.writeln(me.proto + ' ' + me.status + ' ' + responseCodeText[me.status]);
        os.writeln('Date: ' + new Date().toGMTString());
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                os.writeln(key + ': ' + headers[key]);
            }
        }
        if (me.cookies && !me.headers['Set-Cookie']) {
            decaf.each(me.cookies, function (cookie, key) {
                var out = 'Set-Cookie: ' + key + '=' + encodeURIComponent(cookie.value);
                if (cookie.expires) {
                    out += '; Expires=' + cookie.expires;
                }
                if (cookie.path) {
                    out += '; Path=' + cookie.path;
                }
                if (cookie.domain) {
                    out += '; Domain=' + encodeURIComponent(cookie.domain);
                }
                os.writeln(out);
            });
        }
        os.writeln('');
    },

    /**
     * complete response
     *
     * @param {string} s body of response
     */
    end: function (s, gzip) {
        var os = this.os,
            headers = this.headers;

        if (s) {
            if (toString.apply(s) === '[object Array]') {
                s = s.join('\n');
            }
            s = decaf.toJavaByteArray(s);
            if (gzip) {
                s = GZIP.compress(s);
                headers['Content-Encoding'] = 'gzip';
            }
            headers['Content-Length'] = s.length;
        }
        this.sendHeaders();
        if (s) {
            if (typeof s === 'string') {
                os.write(s);
            }
            else {
                os.flush();
                os.writeBytes(s, 0, s.length);
            }
        }
        os.flush();
    },

    /**
     * Complete request handling.
     *
     * This method does not return.  The request is assumed to be completed.
     *
     * You can call this from within nested methods to terminate/complete the request.
     */
    stop: function () {
        throw 'RES.STOP';
    },

    /**
     * Issue a 303 redirect to the specified URI
     *
     * @param {string} uri
     */
    redirect: function (uri) {
        var me = this,
            os = me.os;

        me.status = 303;
        var base;
        if (uri.substr(0, 7) !== 'http://' && uri.substr(0, 8) !== 'https"://') {
            base = 'http://';
            base += me.req.host;
            if (me.port !== 80) {
                base += ':' + me.req.port;
            }
            uri = base + uri;
        }
        me.headers['Location'] = uri;
        os.writeln(me.proto + ' ' + me.status + ' ' + responseCodeText[me.status]);
        os.writeln('Location: ' + uri);
        os.flush();
//        me.end();
        me.stop();
    },

    /**
     * Flush the response output stream.
     */
    flush: function () {
        this.os.flush();
    }
});

decaf.extend(exports, {
    responseCodeText: responseCodeText,
    Response        : Response
});
