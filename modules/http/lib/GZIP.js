/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/23/13
 * Time: 9:08 AM
 */

"use strict";

/*global java */
/**
 * @class http.GZIP
 * @static
 * A class for compressing a string or byte array using GZIP.
 */
var GZIP = {
    /**
     * Compress a Java byte array or String using GZIP compression.
     *
     * @param {String|Array.<Number>} input the string or byte array to compress.
     * @returns {Array.<Number>} compressed version of input
     */
    compress: function(input) {
        if (typeof input === 'string') {
            input = decaf.toJavaByteArray(input);
        }
        var os = new java.io.ByteArrayOutputStream(),
            gz = new java.util.zip.GZIPOutputStream(os);
        gz.write(input, 0, input.length);
        gz.finish();
        return os.toByteArray();
    }
};

decaf.extend(exports, {
    GZIP: GZIP
});
