/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 3:53 PM
 */

/**
 * Global include().
 *
 * A global variable (function) include() is present in all decafjs contexts.
 *
 * The purpose of include() is to provide a server side mechanism that is the equivalent of script tags on the client side.  That is,
 * the JavaScript you load is loaded inline and executed.
 *
 * The function of include() is very different from that of require() (see require).  Every function defined in the scope of the included file will be present in the
 * global scope of the decafjs application from that point forward.
 *
 * Like require(), include provides both an include.paths array and an include.extensions object.  The latter provides a hook for included text to be run through a preprocessor such as coffeescript.
 *
 * For example:
 *
 * ```javascript
 * require.extensions['.coffee'] = function(filename) {
 *   return coffee.compile(new File(filename).readAll());
 * };
 *
 * var myCoffeeScriptModule = require('mymodule.coffee');
 * // OR
 * var myCoffeeScriptModule = require('mymodule'); // knows to try .coffee extension
 * ```
 */

/** @private */
/*global builtin, include: true */
(function() {
    "use strict";

    var fs = builtin.fs;

    function locateFile(fn) {
        var extension;

        if (fs.isFile(fn)) {
            return fn;
        }
        if (fs.isFile(fn + '.js')) {
            return fn + '.js';
        }
        else {
            for (extension in include.extensions) {
                if (fs.isFile(fn + '.' + extension)) {
                    return fn + '.' + extension;
                }
            }
        }
        if (fn.substr(0, 1) == '/' || fn.substr(0, 2) == './' || fn.substr(0, 3) == '../') {
            throw 'Could not locate include file ' + fn;
        }
        var paths = include.paths;
        for (var i = 0, len = paths.length; i < len; i++) {
            var path = paths[i];
            if (path.substr(path.length - 1, 1) != '/') {
                path += '/';
            }
            path += fn;
            if (fs.isFile(path)) {
                return path;
            }
            if (fs.isFile(path + '.js')) {
                return path + '.js';
            }
            else {
                for (extension in include.extensions) {
                    if (fs.isFile(fn + '.' + extension)) {
                        return fn + '.' + extension;
                    }
                }
            }
        }
        throw Error('Could not locate include file ' + fn);
    }

    function includeFile(fn) {
        fn = locateFile(fn);
        var contents = fs.readFile(fn),
            extension = fn.indexOf('.') !== -1 ? fn.substr(fn.lastIndexOf('.')+1) : '';

        if (include.extensions[extension]) {
            var ret = include.extensions[extension](contents, fn);
            return ret;
        }
        contents = contents.replace(/^#!/, '//');
        return builtin.rhino.runScript(contents, fn, 1, this);
    }

    /**
     * @global
     * @param [...] files files to include
     */
    global.include = function() {
        var argLen = arguments.length;
        for (var i = 0; i < argLen; i++) {
            includeFile.call(this, arguments[i]);
        }
    };
    /**
     * @memberOf global.include
     * @type {Array}
     */
    include.paths = [
        'bower_components',
        'bower_components/decaf',
        'bower_components/decaf/classic',
        'bower_components/decaf/modules',
        './',
        './classic',
        './modules',
        './examples',
        '/usr/local/decaf',
        '/usr/local/decaf/classic',
        '/usr/local/decaf/modules',
        '/usr/local/decaf/examples'
    ];
    /**
     * @public
     * @memberOf global.include
     * @type {{}}
     */
    include.extensions = {};
}());
