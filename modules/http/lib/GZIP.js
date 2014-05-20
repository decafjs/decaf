/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/23/13
 * Time: 9:08 AM
 * To change this template use File | Settings | File Templates.
 */

"use strict";

/*global java */
var GZIP = {
    compress: function(s) {
        if (typeof s === 'string') {
            s = decaf.toJavaByteArray(s);
        }
        var os = new java.io.ByteArrayOutputStream(),
            gz = new java.util.zip.GZIPOutputStream(os);
        gz.write(s, 0, s.length);
        gz.finish();
        return os.toByteArray();
    }
};

decaf.extend(exports, {
    GZIP: GZIP
});
