/**
 * Construct a Json instance.
 *
 * The Json instance has the ability to handle sending JSON and JSONP success, failure, and
 * exception responses.
 *
 * To deal with JSONP, and to handle responses that require being wrapped in textarea tag, the
 * methods look at the req (Request) headers and data.
 *
 * @param {Request} req http.Request object
 * @param {Response} res http.Response object
 * @constructor
 */
function Json(req, res, gzip) {
    this.req = req;
    this.res = res;
    if (gzip === undefined) {
        this.gzip = true;
    }
    else {
        this.gzip = gzip;
    }
}
decaf.extend(Json.prototype, {
    /**
     * ### Synopsis
     *
     *      var s = Json.format(obj);
     *      var s = Json.format(obj, spaces);
     *
     * Encode an object as JSON and return it as a formatted string, suitable for printing.
     *
     * @param {Object} obj - object to format.
     * @param {int} spaces - number of spaces to indent while formatting.
     */
    format: function(o, spaces) {
        spaces = spaces || 4;
        return JSON.stringify(o, null, spaces);
    },

    /**
     * ### Synopsis
     *
     *      var s = Json.encode(obj);
     *
     * Encode an object using NATIVE JSON object for speed
     *
     * @param {Object} obj - Object to be encoded as a string
     * @returns {string} s - Object encoded as a string
     */
    encode: function(o) {
        return JSON.stringify(o);
    },

    /**
     * ### Synopsis
     *
     *      var obj = Json.decode(s);
     *
     * Decode a string using NATIVE JSON object for speed
     *
     * @param {string} s - String to be decoded
     * @returns {Object} obj - Object decoded from string
     */
    decode: function(s) {
        return JSON.parse(s);
    },

    /**
     * ### Synopsis
     *
     *      var s = Json.successString(obj);
     *
     * Generate a JSON encoded success string from an Object
     *
     * @param {Object} obj - Object/Response to be sent to client
     * @returns {string} s = Wrapped Object converted to JSON with success indication
     */
    successString: function(obj) {
        obj.success = true;
        return this.encode(obj);
    },

    /**
     * ### Synopsis
     *
     *      Json.send(json_string);
     *
     * Send an already JSON encoded string and end the request.
     *
     * @param {string} json_string - String to be sent
     */
    send: function(json, status) {
        var req = this.req, 
            res = this.res;

		status = status || 200;

        if (req.data.callback) {
			res.writeHead(status, {
				'Content-type': 'text/javascript'
			});
            res.end([req.data.callback, '(', json, ')'].join(''), this.gzip);
        }
        else {
            var contentType = req.headers['content-type'] || '';
            if (contentType.indexOf('multipart/form-data') != -1) {
                // it's something like a post through an invisible iframe, so we wrap the reponse in  textarea tags
				res.writeHead(status, {
					'Content-type': 'text/html'
				});
                res.end('<textarea>' + json + '</textarea>', this.gzip);
            }
            else {
				res.writeHead(status, {
					'Content-type': 'application/json'
				});
                res.end(json, this.gzip);
            }
        }
    },

    /**
     * ### Synopsis
     *
     *      Json.success(obj);
     *
     * Send success response to client.  The obj argument has success: true added to it, and it is sent to the client.  If no object is passed, then { success: true } is sent.
     *
     * @param {Object} obj - object to send to the client
     */
    success: function(obj) {
        var req = this.req,
            res = this.res;

        obj = obj || {};
        obj.success = true;
		this.send(this.encode(obj));
        res.stop();
    },

    /**
    * ### Synopsis
    *
    *       Json.failure(message);
    *
    * Send an error/failure response to the client.  The content has the form { success: false, message: 'text of failure description' },
    *
    * @param {string} message - message to send
    */
    failure: function(msg) {
        var req = this.req, 
            res = this.res,
            responseObj = {
                success: false,
                message: msg
            };
		
        this.send(this.encode(responseObj));
		res.stop();
    },

    /**
     * ### Synopsis
     *
     *      Json.exception(msg);
     *
     * Similar to Json.failure, except this differentiates between failures and try/catch type exceptions.  The message is typically the cause of the exception with stack trace.
     *
     * The object sent to the client looks like { success: false, excsption: 'message' }
     *
     * @param {string} msg - text to send as exception.
     */
    exception : function(msg) {
        var req = this.req,
            res = this.res;

        this.send(this.encode({
            success   : false,
            exception : msg
        }), 500);
		res.stop();
    }
});

decaf.extend(exports, {
	Json: function(req, res) { return new Json(req, res); }
});

