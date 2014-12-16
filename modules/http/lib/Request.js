"use strict";

/**
 * Construct a Request instance
 *
 * Request instances are typically automatically created by http.Child
 *
 * @constructor
 * @param {InputStream} is InputStream
 * @param {int} maxUpload maximum bytes allowed for file upload
 */
function Request(is, maxUpload) {
    this.is = is;
    maxUpload = maxUpload || (10 * 1024 * 1024); // default max upload is 10M

    var line;

    line = is.readLine();
    if (line === false) {
        throw 'EOF';
    }
    // parse 1st line
    var parts = line.split(/\s+/),
        uri = parts[1],
        uriParts = uri.split('?'),
        queryParams = {},
        data = {};

    if (uriParts[1]) {
        decaf.each(uriParts[1].split('&'), function(part) {
            part = part.split('=');
            try {
                queryParams[part[0]] = data[part[0]] = decodeURIComponent(part[1].replace(/\+/g, ' '));
            }
            catch (e) {

            }
        });
    }

    /**
     * A hash that contains the values of the query string part of the requested URL.
     *
     * The query string is the part of the URL that starts with ? and has the form ?name=value[&name=value...]
     *
     * If the URL ends with ?foo=10&bar=20, then req.queryParams will be:
     *
     *      { foo: 10, bar: 20 }
     */
    this.queryParams = queryParams;

    /**
     * The part of the requested URL up to, but not including, the query string.
     *
     * If the URL is http://company.com/something?foo=10&bar=20, then the value of req.uri will be
     *
     *      /something
     */
    this.uri = uriParts[0];

    /**
     * The request method.
     *
     * The value of this field will be something like 'GET' or 'POST' or 'HEAD'
     */
    this.method = parts[0].toUpperCase();

    /**
     * The request protocol
     *
     * The value of this field will be something like 'HTTP/1.0' or 'HTTP/1.1'
     */
    this.proto = (parts[2] || 'http/0.9').toUpperCase();
    // parse headers
    var headers = {};
    var done = false;
    for (var i = 0; i < 64; i++) {
        line = is.readLine();
        if (line === false) {
            throw 'EOF';
        }
        if (line.length === 0) {
            done = true;
            break;
        }
        parts = line.split(/:\s+/);
        headers[parts[0].toLowerCase()] = parts[1];
    }
    while (!done) {
        line = is.readLine(is);
        // line = inputStream.readLine();
        if (line === false) {
            throw 'EOF';
        }
        if (line.length === 0) {
            done = true;
            break;
        }
    }

    /**
     * A hash that contains the request headers.
     *
     * The keys in the hash are lower case, so you don't have to worry about the browser sending User-Agent vs. User-agent.
     *
     * Example:
     *
     *      {
     *          'accept-encoding': 'gzip,deflate,sdch','
     *          'accept-language': 'en-US,en;q=0.8','
     *          'cache-control': 'max-age=0','
     *          'connection': 'keep-alive','
     *          'host': 'localhost:8080','
     *          'referer': 'http://localhost:8080/api/MySQL',
     *          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36'
     *      }
     */
    this.headers = headers;

    var host = 'localhost';
    var port = is.serverPort;
    if (headers.host) {
        host = headers.host.split(':');
        port = host[1] || '80';
        host = host[0];
    }

    /**
     * The host part of the requested URL.
     *
     * If the URL was http://company.com/something?foo=10&bar=20, the value of req.host will be
     *
     *      company.com
     */
    this.host = host;

    /**
     * The port part of the requested URL.
     *
     * If the URL was http://company.com:9090/something?foo=10&bar=20, the value of req.port will be
     *
     *      9090
     *
     * Defaults to 80 if no port specified in the URL
     */
    this.port = port;

    /**
     * The IP address of the remote side of the connection.
     *
     * In other words, the IP address of the browser hitting the server.
     */
    this.remote_addr = is.remoteAddress();

    var cookies = {};
    if (headers.cookie) {
        try {
            decaf.each(headers.cookie.split(/;\s*/), function(cookie) {
                var cookieParts = cookie.split('=');
                cookies[cookieParts[0]] = data[cookieParts[0]] = decodeURIComponent(cookieParts[1].replace(/\+/g, ''));
            });
        }
        catch (e) {

        }
    }

    /**
     * A hash containing the cookies sent to the server.
     *
     * Index by name of cookie to get its value.
     */
    this.cookies = cookies;

    // process POST data
    var contentLength = parseInt(headers['content-length'] || '0',10);

    if (contentLength) {
        if (contentLength > maxUpload) {
            throw new Error('413 File upload exceeds ' + maxUpload + ' bytes');
        }

        var raw = is.read(contentLength),
            contentType = (headers['content-type'] || ''),
            post,
            mimeParts = [];


        if (contentType.toLowerCase().indexOf('multipart/form-data') !== -1) {
            // handle multipart mime
            post = String(new java.lang.String(raw, 'latin1'));
            var boundary = contentType.replace(/^.*?boundary=/i, '');
            mimeParts = post.split('--' + boundary);
            mimeParts.shift();
            mimeParts.pop();
            decaf.each(mimeParts, function(part) {
                part = part.substr(2).slice(0, -2);
                var line,
                    len,
                    mimePart = {};

                while (true) {
                    line = part.split('\r\n', 1)[0];
                    len = line.length;
                    part = part.substr(len + 2);
                    if (len === 0) {
                        break;
                    }
                    var [ mimeKey, mimeValue ] = line.split(': ');
                    switch (mimeKey.toLowerCase()) {
                        case 'content-disposition':
                            decaf.each(mimeValue.split(/;\s*/), function(disposition) {
                                var [ key, value ] = disposition.split('=');
                                if (value !== undefined) {
                                    mimePart[key.toLowerCase()] = value.replace(/"/g, '');
                                }
                            });
                            break;
                        case 'content-type':
                            mimePart.contentType = mimeValue;
                            break;
                        default:
                            mimePart[mimeKey.toLowerCase()] = mimeValue;
                            break;
                    }
                }
                mimePart.content = part;
                mimePart.size = part.length;
                data[mimePart.name] = mimePart;
            });
        }
        else if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
            post = String(new java.lang.String(raw, 'utf8')),
            decaf.each(post.split('&'), function(part) {
                part = part.split('=');
                data[part[0]] = decodeURIComponent(part[1].replace(/\+/gm, ' '));
            });
        }
        else if (contentType.indexOf('application/json') !== -1) {
            post = String(new java.lang.String(raw, 'utf8'));
            this.post = JSON.parse(post);
            decaf.extend(data, this.post);
        }
        else {
            post = String(new java.lang.String(raw, 'latin1')),
            data.post = post;
            this.post = post;
        }
    }

    /**
     * A hash containing all of the query parameters, and form data.
     *
     * Index by name of form field or query parameter to get the value.
     */
    this.data = data;

    var gzip = headers['accept-encoding'];
    this.gzip = gzip && (gzip.indexOf('gzip') !== -1);
}

decaf.extend(exports, {
    Request : Request
});
