/**
 * # Builtin (private) Filesystem methods.
 *
 * The builtin.fs object.  Low-level file system methods
 *
 * These methods should be considered private as they are used internally by require() and include().
 * @fileoverview
 */

/** @private */
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
         * ## builtin.fs.isFile(path) : boolean
         *
         * Test if the specified path is a file.
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
         * ## builtin.fs.isDir(path) : boolean
         *
         * Test if a path is a directory.
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
         * ## builtin.fs.realpath(path) : boolean
         *
         * Returns the canonical path that the argument path corresponds to.
         * If the file or directory does not exist, false is returned.
         *
         * Example:
         *
         * ./foo/../bar -> bar
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
         * ## builtin.fs.readFile(path) : String
         *
         * Read a file into a string.
         *
         * @memberOf builtin.fs
         * @param path
         * @returns {*}
         */
        readFile: function(path) {
            var file = resolveFile(path),
                body = new ByteArrayOutputStream(),
                stream = new BufferedInputStream(new FileInputStream(file)),
                buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024),
                count;

            while ((count = stream.read(buf)) > -1) {
                body.write(buf, 0, count);
            }
            stream.close();
            return String(body.toString());
        }
        /** @private */
    };

}());