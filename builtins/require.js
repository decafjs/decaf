/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/7/13
 * Time: 5:05 PM
 */
/*
 * CommonJS require 1.1 implementation
 */

/*global require, builtin */

(function() {
    var rhino = builtin.rhino,
		File = java.io.File
		FileInputStream = java.io.FileInputStream,
		BufferedInputStream = java.io.BufferedInputStream,
		ByteArrayOutputStream = java.io.ByteArrayOutputStream;

    /**
     * @private
     */
    
	// thanks to ringojs for this one
    function resolveFile( path ) {
        var file = path instanceof File ? path : new File(String(path));
        return file.isAbsolute() ? file : file.getAbsoluteFile();
    }

    var fs = {
        isFile : function( path ) {
            var file = resolveFile(path);
            return file.isFile();
        },

        isDir : function( path ) {
            var file = resolveFile(path);
            return file.isDirectory();
        },

        realpath : function( path ) {
            var file = resolveFile(path);
            return file.exists() ? String(file.getCanonicalPath()) : false;
        },

        readFile : function( path ) {
            var file = resolveFile(path),
                body = new ByteArrayOutputStream(),
                stream = new BufferedInputStream(new FileInputStream(file)),
                buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024),
                count;

            while ( (count = stream.read(buf)) > -1 ) {
                body.write(buf, 0, count);
            }
            stream.close();
            return String(body.toString());
        }
    };



	function realpath(path) {
		var f = new File(path);
		return String(f.getAbsolutePath().toString());
	}

    function locateFile(module) {
        var extension;

        function tryFile(path) {
            var tryPath = fs.realpath(path);
            if (tryPath) {
                if (fs.isFile(tryPath)) {
                    return tryPath;
                }
                else if (fs.isDir(tryPath)) {
                    if (!tryPath.endsWith('/')) {
                        tryPath += '/';
                    }
                    tryPath += 'index.js';
                }
                if (fs.isFile(tryPath)) {
                    return tryPath;
                }
            }
            tryPath = fs.realpath(require.fsPath + path);
            if (tryPath) {
                if (fs.isFile(tryPath)) {
                    return tryPath;
                }
                else if (fs.isDir(tryPath)) {
                    if (!tryPath.endsWith('/')) {
                        tryPath += '/';
                    }
                    tryPath += 'index.js';
                }
                if (fs.isFile(tryPath)) {
                    return tryPath;
                }
            }
            return false;
        }

        var found;
        if (module[0] == '/' || module.substr(0, 2) == './' || module.substr(0, 3) == '../') {
			var relpath = module[0] == '/' ? module : realpath(require.fsPath + module);
            found = tryFile(relpath) || tryFile(relpath + '.js');
            if (found) {
                return found;
            }
            for (extension in require.extensions) {
                found = tryFile(module + '.' + extension);
                if (found) {
                    return found;
                }
            }
        }
        else {
            var paths = require.path;
            for (var i = 0, len = paths.length; i < len; i++) {
                var path = paths[i];
                if (path.substr(path.length - 1, 1) != '/') {
                    path += '/';
                }
                path += module;
                found = tryFile(path) || tryFile(path + '.js');
                if (found) {
                    return found;
                }
                for (extension in require.extensions) {
                    found = tryFile(path + '.' + extension);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        throw new Error('Could not locate require file ' + module);
    }

    function loadFile(modulePath) {
        var contents = fs.readFile(modulePath);
        var extension = modulePath.indexOf('.') !== -1 ? modulePath.substr(modulePath.lastIndexOf('.')+1) : '';

        if (require.extensions[extension]) {
            contents = require.extensions[extension](contents);
        }
        return contents;
    }

    /**
     * @global
     * @param module
     * @returns {*}
     */
    global.require = function(module) {
        if (module.substr(0, 8) == 'builtin/' || module.substr(0, 8) === 'builtin.') {
            return builtin[module.substr(8)];
        }
        var modulePath = locateFile(module);
        if (require.cache[modulePath]) {
            return require.cache[modulePath].exports;
        }
        var content = loadFile(modulePath);
        require.dirStack.push(require.fsPath);
        var fsPath = modulePath.split('/');
        fsPath.pop();
        require.fsPath = fsPath.join('/') + '/';



        // works
//        var exports = require.cache[modulePath] = {};
//        var script = [
//            '(function() {',
//            '	var exports = {}', //  module.exports;',
//            '	var module = {',
//            '		id: "' + module + '",',
//            '       fsPath: "' + require.fsPath + '",',
//            '		url: "' + modulePath + '",',
//            '       exports: null',
//            '	};',
//            content,
//            '	return module.exports || exports;',
//            '}())'
//        ].join('\n');
//        require.modulePath = modulePath;
//        require.cache[modulePath] = rhino.runScript(script, modulePath, 0);

        var exports = require.cache[modulePath] = {
            id: module,
            url: modulePath,
            exports: {}
        };

        var script = [
            '(function() {',
            '   var module = global.require.getCached("' + modulePath + '");',
//            '	var module = {',
//            '		id: "' + module + '",',
//            '		url: "' + modulePath + '",',
//            '       exports: global.require.getCached("' + modulePath + '")',
//            '	};',
            '   var exports = module.exports;',
            content,
            '	return module.exports;',
            '}())'
        ].join('\n');
        require.modulePath = modulePath;
        var x = rhino.runScript(script, modulePath, 0);
//        console.log('>>> ' + modulePath)
//        console.dir(exports);
//        console.dir(x);
//        require.cache[modulePath].extend(exports);
//        require.cache[modulePath].prototype = exports.prototype;

        require.fsPath = require.dirStack.pop();
        require.modulePath = null;
        return require.cache[modulePath].exports;
    };

    require.getCached = function(path) {
        return require.cache[path];
    };

    require.isRequiredFile = function(fn) {
        return require.modulePath === fn || (require.cache[fn] ? true : false);
    };

    require.main = this;
    require.dirStack = [];
    require.fsPath = '';
    require.cache = {};
    /**
     * @memberOf global.require
     * @type {Array}
     */
    require.path = [
        'bower_components',
        'languages',
        'modules',
        '/usr/local/decaf',
        '/usr/local/decaf/languages',
        '/usr/local/decaf/modules',
        './'
    ];

    /**
     *  An object used to extend the way [require][#require] loads modules.
     *
     *  Use a file extension as key and a function as value. The function should
     *  accept a `Resource` object as argument and return either a string to be
     *  used as JavaScript module source or an object which will be directly
     *  returned by `require`.
     *
     *  For example, the following one-liner will enable `require()` to load XML
     *  files as E4X modules:
     *
     *     require.extensions['.xml'] = function(r) new XML(r.content);
     *
     * @memberOf global.require
     */
    require.extensions = {};

}());
