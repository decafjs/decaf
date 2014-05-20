/**
 * @fileoverview The builtin.fs object.  Low-level file system methods
 */

/*global builtin:true, java */
(function() {
    "use strict";

    var File = java.io.File,
        FileInputStream = java.io.FileInputStream,
        BufferedInputStream = java.io.BufferedInputStream,
        ByteArrayOutputStream = java.io.ByteArrayOutputStream;


    // thanks to ringojs for this one
    function resolveFile(path) {
        var file = path instanceof File ? path : new File(String(path));
        return file.isAbsolute() ? file : file.getAbsoluteFile();
    }

    /**
     * @private
     * @module builtin.fs
     * @type {{isFile: Function, isDir: Function, realpath: Function, readFile: Function}}
     */
    builtin.fs = {
        /**
         *
         * @memberOf builtin.fs
         * @param path
         * @returns {*}
         */
        isFile: function(path) {
            var file = resolveFile(path);
            return file.isFile();
        },
        /**
         *
         * @memberOf builtin.fs
         * @param path
         * @returns {*}
         */
        isDir: function(path) {
            var file = resolveFile(path);
            return file.isDirectory();
        },
        /**
         *
         * @memberOf builtin.fs
         * @param path
         * @returns {*}
         */
        realpath: function(path) {
            var file = resolveFile(path);
            return file.exists() ? String(file.getCanonicalPath()) : false;
        },
        /**
         *
         * @memberOf builtin.fs
         * @param path
         * @returns {*}
         */
        readFile: function(path) {
            var file = resolveFile(path),
                body = new ByteArrayOutputStream(),
                stream = new BufferedInputStream(FileInputStream(file)),
                buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024),
                count;

            while ((count = stream.read(buf)) > -1) {
                body.write(buf, 0, count);
            }
            stream.close();
            return String(body.toString());
        }
    };

}());