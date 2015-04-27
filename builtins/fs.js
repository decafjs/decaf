/**
 * @class builtin.fs
 * @singleton
 *
 * # Builtin (private) Filesystem methods.
 *
 * The builtin.fs object.  Low-level file system methods
 *
 * These methods should be considered private as they are used internally by require() and include().
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

    builtin.fs = {
        /**
         * Test if the specified path is a file.
         *
         * @param path
         * @returns {Boolean} true if specified path is a file.
         */
        isFile: function(path) {
            var file = resolveFile(path);
            return file.isFile();
        },
        /**
         * Test if a path is a directory.
         *
         * @param path
         * @returns {Boolean} true if specified path is a directory.
         */
        isDir: function(path) {
            var file = resolveFile(path);
            return file.isDirectory();
        },
        /**
         * Returns the canonical path that the argument path corresponds to.
         * If the file or directory does not exist, false is returned.
         *
         * Example:
         *
         * ```javascript
         * fs.realPath('./foo/../bar'); // -> bar
         * ```
         * @param path
         * @returns {String} cannonical path or false if file/directory does not exist.
         */
        realpath: function(path) {
            var file = resolveFile(path);
            return file.exists() ? String(file.getCanonicalPath()) : false;
        },
        /**
         * Read a file into a string.
         *
         * @param path
         * @returns {String} contents of file.
         * @throws {Error} error if file could not be read, doesn't exist, etc.
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
    };

}());