/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/24/13
 * Time: 10:01 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @private
 */
var {URL, HttpUrlConnection} = java.net,
    {BufferedReader, InputStreamReader, DataOutputStream} = java.io,
    toJavaByteArray = decaf.toJavaByteArray;

/**
 * Construct a HTTP Client
 *
 * After the GET/POST operation is complete, you can inspect these members of the Client object:
 *
 * {string} status - HTTP status (e.g. 200, 404, etc.)
 * {string} responseMessage - HTTP response message (e.g. OK, NOT FOUND, etc.)
 * {string} responseText - the text of the HTTP response from the server (typically the HTML or JSON it sent us)
 *
 * @param {string} url URL to connect to
 * @constructor
 */
function Client( url ) {
    this.conn = new URL(url).openConnection();
}

/**
 * @private
 * @param conn
 * @returns {string}
 */
function getResponseText( conn ) {
    var rd = new BufferedReader(new InputStreamReader(conn.getInputStream())),
        response = [],
        line;

    while ((line = rd.readLine())) {
        response.push(String(line));
    }
    rd.close();
    return response.join('\n');
}

decaf.extend(Client.prototype, {
    /**
     * Set client to follow (or not) redirects sent by server.
     *
     * @param {boolean} state true to follow redirects (default is false)
     * @chainable
     */
    setFollowRedirects : function( state ) {
        this.conn.setInstanceFollowRedirects(state);
        return this;
    },

    /**
     * Set a request header
     *
     * @param {string} key name of header to set
     * @param {string} value value of header to set
     * @chainable
     */
    setHeader : function( key, value ) {
        this.conn.setRequestProperty(key, value);
        return this;
    },

    /**
     * Post a form or JSON to the connection
     *
     * The form data is a hash of name/value pairs; name is name of the form field, value is the value.
     *
     * If the form argument is a string, it is assumed to be a object serialized as a JSON .string
     *
     * The value returned is the client object.  It can be inspected for responseText, responseCode, etc.
     *
     * @param {object} form the form data
     * @chainable
     */
    post : function( form ) {
        var formData,
            contentType;

        if (decaf.isString(form) {
            formData = form;
            contentType = 'application/json';
        }
        else {
            formData = [];
            contentType = 'application/x-www-form-urlencoded';

            decaf.each(form, function( value, key ) {
                formData.push(key + '=' + value);
            });
            formData = formData.join('&');
        }

        this.conn.setDoOutput(true);
        this.conn.setDoInput(true);
        this.conn.setUseCaches(false);
        this.conn.setRequestMethod('POST');
        this.conn.setRequestProperty('Content-Type', contentType);
        this.conn.setRequestProperty('charset', 'utf-8');
        this.conn.setRequestProperty('Content-Length', '' + toJavaByteArray(formData).length);

        var wr = new DataOutputStream(this.conn.getOutputStream());
        wr.writeBytes(formData);
        wr.flush();
        wr.close();

        this.responseText = getResponseText(this.conn);
        this.status = this.conn.getReponseCode();
        this.responseMessage = this.conn.getResponseMessage();
        this.conn.disconnect();
        delete this.conn;
        return this;
    },

    /**
     * Issue GET request to the connection.
     *
     * The value returned is the client object.  It can be inspected for responseText, responseCode, etc.
     *
     * @chainable
     */
    get : function() {
        this.conn.setRequestMethod('GET');
        this.responseText = getResponseText(this.conn);
        this.status = this.conn.getResponseCode();
        this.responseMessage = String(this.conn.getResponseMessage());
        this.conn.disconnect();
        delete this.conn;
        return this;
    }
});

decaf.extend(exports, {
    Client : Client
});
