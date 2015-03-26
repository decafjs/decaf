/**
 * # require()
 *
 * CommonJS require 1.1 implementation.
 *
 Modules and require()
 =====================

 Modules are loaded via the global require() function.  The Decaf implementation of require() is [CommonJS Modules 1.1 compliant](http://wiki.commonjs.org/wiki/Modules/1.1), but also implements enough of [NodeJS require() to load modules for NodeJS](http://nodejs.org/api/modules.html).  The Decaf implementation also will load modules installed via [Bower](http://bower.io).  The Decaf implementation has some handy extensions as well.

 A few examples should help you understand how require() works, and how to implement modules.

 Consider this example module, in a project's top directory.  Call it `./increment.js`:

 ```javascript
 // increment.js

 var private_variable = 10;

 function increment(n) {
	return n+1;
}

 function decrement(n) {
	return n-1;
}
 exports.increment = increment;
 exports.decrement = decrement;
 ```

 In your project's application (call it `app.js`):

 ```javascript
 // app.js
 var increment = require('./increment').increment,
 decrement = require('./increment').decrement;

 console.log(increment(1));  // => 2
 console.log(decrement(10)); // => 9
 ```

 *Note: private_variable within the module's file is visible only within the module.*

 In CommonJS style modules, the exports variable is returned by require().  A second call to require() to load the same module will return the same exports variable instead of doing the actual load a second time.

 **DO NOT modify the exports variable directly**
 ```javascript
 exports = function() { return 'I broke it!'; };
 ```

 Instead, the Decaf implementation of require() supports NodeJS style `module.exports`:
 ```javascript
 module.exports = function() { return 'this is fine!'; };
 module.exports.foo = function() { return 'foo here'; };
 // this is valid, too:
 decaf.extend(module.exports, {
	increment: function(n) { return n+1; },
    decrement: function(n) { return n-1; }
});
 ```

 The rule is either agument `exports` or `module.exports`, OR you may store to `module.exports`.  Do not deal with both in your modules.

 ### Destructuring assignments

 The Rhino version of Decaf supports [harmony style destructuring assignments](http://wiki.ecmascript.org/doku.php?id=harmony:destructuring), which help using modules a bit nicer:

 ```javascript
 var {increment, decrement} = require('./increment');
 ```

 The builtin `decaf` object has a handy extend() method for building classes and defining modules:
 ```javascript
 decaf.extend(exports, {
	increment: function(n) { return n+1; },
    decrement: function(n) { return n-1; }
});
 ```

 ### Module ID and Paths

 The argument to require() is the ID of the module to be loaded.  The ID may be an absolute or relative path, or just the module name.  Optionally, the name may include the .js file extension - but this is not considered good form.

 In our example, the ID is `./increment`.  The require() function sees that the ID starts with "./" so it knows the path to the module is relative to the current directory.  The .js is not included in the string, but require() knows to load `./increment.js`.

 When you call require() from within a module, the concept of "current directory" becomes the module's directory.  That is:

 ```javascript
 // ./lib/bump.js
 decaf.extend(exports, {
	increment: require('./increment'),
    decrement: require('./decrement')
});
 ```

 And in the main program:
 ```javascript
 // main.js
 var increment = require('./lib/bump').increment;
 ```

 The loader first loads `lib/bump.js`, which in turn loads `./increment.js`.  The file loaded is lib/increment.js because the "current directory" within the bump.js module context is `./lib`.

 ### require.paths

 There is a special array, `require.paths`, that contains a list of paths to be searched, in order, to find a module.  So our `main.js` could also have been written thus:

 ```javascript
 require.paths.unshift('./lib');
 var increment = require('bump').increment;
 ```

 Since we added "./lib" to the `require.path` array, `require()` knows how to find the bump module.

 ### require.extensions

 There is a hash object `require.extensions` that allows require() to be extended to support loading modules written in languages other than JavaScript.  The key in this hash is the file extension (e.g. ".coffee") and the value is a function that returns JavaScript source:

 ```javascript
 require.extensions['.coffee'] = function(filename) {
	return coffee.compile(new File(filename).readAll());
};

 var myCoffeeScriptModule = require('mymodule.coffee');
 // OR
 var myCoffeeScriptModule = require('mymodule'); // knows to try .coffee extension
 ```

 ### Directory as Module (index.js)

 It is quite common that a module ID may be as a directory rather than a file.  In this case, require() looks for a file named "index.js" within the directory and loads that.

 ```javascript
 // bump/index.js
 decaf.extend(exports, {
	increment: require('./increment'),
    decrement: require('./decrement')
});
 ```

 And in app.js:
 ```javascript
 var increment = require('bump').increment;  // bump is a directory, index.js is loaded
 ```

 ### Bower modules (bower.json)

 The Bower package manager is an ideal solution for Decaf modules.  For example, `lib/bump/bower.json` might contain:

 ```javascript
 {
     "name": "bump",
     "version": "0.0.1",
     "main": "increment.js"
 }
 ```

 And in `lib/bump/increment.js`:
 ```javascript
 // lib/bump/increment.js
 module.exports = {
    increment: function(n) { return n+1; },
    decrement: function(n) { return n-1; }
};
 ```

 And in your application main program:

 ```javascript
 //main.js
 require.paths.push('lib');
 var increment = require('bump').increment;
 ```

 What happens in this case is `require()` sees "bump" is a directory, but contains no "index.js" in that directory.  It does see "bower.json," so it reads that and uses the "main" member to identify the main file for the module.

 ### NodeJS modules (package.json)

 When neither index.js nor bower.json is found in a module directory, the file package.json is tried.  If it exists, it is loaded and its "main" member is used to identify the main file for the module.

 There is no guarantee that Decaf is going to load and run many of the NodeJS modules, especially those that rely heavily on the asynchronous nature and functionality of NodeJS.  However, many modules like HoganJS are likely to work unmodified.

 ## include()

 Decaf also features a global include() method that loads a script file and executes it, something along the lines of eval().  Variables defined in included files become defined in the main program.  You can think of this as the server-side equivalent of &lt;script> tags.

 There is an include.paths array that specifies an order of paths to try when searching for a file to include.

 There is an includes.extensions hash object that works in a similar manner as require.extensions.

 It is generally a better idea to use require().

 ## Bower as Package Manager for Decaf

 Bower is the package manager of choice for Decaf modules.  In fact, Decaf itself is a Bower compatible package.  Let's look at the decaf-coffeescript module.  You install it using a simple command:

 ```sh
 % bower install decaf-coffeescript
 # creates bower_compnents/decaf-coffeescript
 ```

 It just so happens that ./bower_components is one of the default require.paths values, so you can:

 ```javascript
 // main.js
 var CoffeeScript = require('decaf-coffeescript').CoffeeScript;
 // Use CoffeeScript to compile, if you like
 ```

 The bower.json file in decaf-coffeescript looks something like this:
 ```javascript
 {
     "name": "decaf-coffeescript",
     "version": "0.0.1",
     "main" : "index.js",
     "ignore" : [
     ],
     "dependencies" : {
     },
     "devDependencies": {
     }
 }
 ```

 So bower_components/decaf-coffeescript/index.js is the file loaded by the require() statement in our main.js.

 ```javascript
 // index.js
 var File = require('File'),
 rhino = require('builtin/rhino'),
 me = {};

 include.call(me, require.fsPath + 'lib/coffee-script.js');
 include.paths.push('./coffeescript');
 require.paths.push('./coffeescript');
 require.extensions.coffee = include.extensions.coffee = function(fn) {
    return rhino.runScript(me.CoffeeScript.compile(new File(fn).readAll(), { bare: true }), fn, 1, this);
};
 exports.CoffeeScript = me.CoffeeScript;
 ```

 The coffeescript compiler is designed to be loaded in a browser environment, so we include() it in the module.  The include.call line causes the included script to assign its variables to the me variable instead of global.

 The module does some trickery to add ./coffeescript to both the include() and require() search paths.  It also adds .coffee extension to require.extensions so require() can be called to load .coffee files.

 ### Scripting Java in Modules

 It's common that a module will rely on some .jar file from the Java ecosphere.  If you are making a module that needs to call into a .jar file, create a java/ directory in your module directory and copy the .jar file there.  Decaf automatically adds any module's java/*.jar to the CLASSPATH.

 For example, the decaf-mongodb module scripts the MongoDB Java Driver .jar file.  The .jar file is located at decaf-mongodb/java/mongo-java-driver-2.11.3.jar.

 This scheme allows Decaf modules and the dependent .jar files to be bundled and installed together.

 */

/** @private */
/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/7/13
 * Time: 5:05 PM
 */

/*global require, builtin */

(function () {
    var rhino = builtin.rhino,
        File = java.io.File,
        FileInputStream = java.io.FileInputStream,
        BufferedInputStream = java.io.BufferedInputStream,
        ByteArrayOutputStream = java.io.ByteArrayOutputStream;

    /** @private */
    // thanks to ringojs for this one
    function resolveFile(path) {
        var file = path instanceof File ? path : new File(String(path));
        return file.isAbsolute() ? file : file.getAbsoluteFile();
    }

    var fs = {
        isFile : function (path) {
            var file = resolveFile(path);
            return file.isFile();
        },

        isDir : function (path) {
            var file = resolveFile(path);
            return file.isDirectory();
        },

        realpath : function (path) {
            var file = resolveFile(path);
            return file.exists() ? String(file.getCanonicalPath()) : false;
        },

        readFile : function (path) {
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

    function realpath(path) {
        var f = new File(path);
        return String(f.getAbsolutePath().toString());
    }

    function locateFile(module) {
        var extension,
            pkg;

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
                tryPath = tryPath.replace(/index.js$/, 'bower.json');
                if (fs.isFile(tryPath)) {
                    try {
                        pkg = JSON.parse(fs.readFile(tryPath));
                        if (decaf.isString(pkg.main)) {
                            tryPath = tryPath.replace(/bower.json$/, pkg.main);
                            if (fs.isFile(tryPath)) {
                                return tryPath;
                            }
                        }
                    }
                    catch (e) {
                    }
                }
                tryPath = tryPath.replace(/bower.json$/, 'package.json');
                if (fs.isFile(tryPath)) {
                    try {
                        pkg = JSON.parse(fs.readFile(tryPath));
                        if (decaf.isString(pkg.main)) {
                            tryPath = tryPath.replace(/package.json$/, pkg.main);
                            if (fs.isFile(tryPath)) {
                                return tryPath;
                            }
                        }
                    }
                    catch (e) {
                    }
                }
            }
            tryPath = fs.realpath(require.fsPath + path);
            if (tryPath) {
                if (fs.isFile(tryPath)) {
                    return tryPath;
                }
                if (fs.isDir(tryPath)) {
                    if (!tryPath.endsWith('/')) {
                        tryPath += '/';
                    }
                    tryPath += 'index.js';
                    if (fs.isFile(tryPath)) {
                        return tryPath;
                    }
                    tryPath = tryPath.replace(/index.js$/, 'bower.json');
                    if (fs.isFile(tryPath)) {
                        try {
                            pkg = JSON.parse(fs.readFile(tryPath));
                            if (decaf.isString(pkg.main)) {
                                tryPath = tryPath.replace(/bower.json$/, pkg.main);
                                if (fs.isFile(tryPath)) {
                                    return tryPath;
                                }
                            }
                        }
                        catch (e) {
                        }
                    }
                    tryPath = tryPath.replace(/bower.json$/, 'package.json');
                    if (fs.isFile(tryPath)) {
                        try {
                            pkg = JSON.parse(fs.readFile(tryPath));
                            if (decaf.isString(pkg.main)) {
                                tryPath = tryPath.replace(/package.json$/, pkg.main);
                                if (fs.isFile(tryPath)) {
                                    return tryPath;
                                }
                            }
                        }
                        catch (e) {
                        }
                    }
                }
            }
            return false;
        }

        var found;
        if (module[0] === '/' || module.substr(0, 2) === './' || module.substr(0, 3) === '../' || module === '..') {
            var relpath = module[0] === '/' ? module : realpath(require.fsPath + module);
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
            var paths = require.paths;
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
        var extension = modulePath.indexOf('.') !== -1 ? modulePath.substr(modulePath.lastIndexOf('.') + 1) : '';

        if (require.extensions[extension]) {
            contents = require.extensions[extension](contents, modulePath);
        }
        return contents;
    }

    /**
     * ## require(module) : exports
     *
     * Loads a JavaScript file or program in a language that compiles into Javascript.
     *
     * - The first time a module is required, it is loaded and executed.
     * - The module is expected to modify its exports or module.exports variable.
     * - The first call to require() of a module returns its exports.
     * - Each successive call to require() of the same module returns the exports without running the code.
     *
     * @global
     * @param module
     * @returns {*}
     */
    global.require = function (module) {
        if (module.substr(0, 8) === 'builtin/' || module.substr(0, 8) === 'builtin.') {
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
            id      : module,
            url     : modulePath,
            content : content,
            exports : {}
        };


        if (false) {

            var fn = new Function('module', 'exports', content + ';\nreturn module.exports;');
            require.modulePath = modulePath;
            try {
                fn(exports, exports.exports);
            }
            catch (e) {
                console.exception(e);
            }
        }
        else {
            var script = [
                '(function() {',                                                    // line 1
                '   var module = global.require.getCached("' + modulePath + '");',  // line 2
                '   var exports = module.exports;',                                 // line 3
                content,                                                            // line 4
                '   return module.exports;',
                '}())'
            ].join('\n');
            require.modulePath = modulePath;

            rhino.runScript(script, modulePath, 1, global);                         // line 4 from script above
        }
        require.fsPath = require.dirStack.pop();
        require.modulePath = null;
        return require.cache[modulePath].exports;
    };

    /**
     * ## require.getCached(path) : exports
     *
     * @private
     * @param path
     * @returns {*}
     */
    require.getCached = function (path) {
        return require.cache[path];
    };

    /**
     * ## require.isRequiredFile(fn) : Boolean
     *
     * See if the specified filename is a file that has been required.
     *
     * @param fn
     * @returns {boolean}
     */
    require.isRequiredFile = function (fn) {
        return require.modulePath === fn || (require.cache[fn] ? true : false);
    };

    /** @private */
    require.main = this;
    require.dirStack = [];
    require.fsPath = '';
    require.cache = {};

    /**
     * ## require.paths
     *
     * This is an array of file system paths that are searched for modules when require() is called.  These may be relative to the current directory where decaf is launched, or absolute paths.
     *
     * @memberOf global.require
     * @type {Array}
     */
    require.paths = [
        'bower_components',
        'bower_components/decaf/modules',
        'node_modules',
        'modules',
        '/usr/local/decaf',
        '/usr/local/decaf/modules',
        './'
    ];

    /**
     * ## require.extensions
     *
     *  An object used to extend the way [require][#require] loads modules.
     *
     *  Use a file extension as key and a function as value. The function should accept a `Resource` object as argument and return either a string to be used as JavaScript module source or an object which will be directly returned by `require`.
     *
     *  For example, the following one-liner will enable `require()` to load .hbs files as HoganJS templates:
     * ```javascript
     *     require.extensions['.hbs'] = function(r) { return Hogan.compile(new File(r).readAll()); }
     * ```
     *
     * @memberOf global.require
     */
    require.extensions = {};

    /** @private */
    /*!
     * ## require.getContent(module) : exports
     *
     * @param module
     * @returns {Mixed} exports
     */
    require.getContent = function (module) {
        var modulePath = locateFile(module);
        require(modulePath);
        if (!require.cache[modulePath]) {
            throw new Error("Can't get content for " + module + ' (' + modulePath + ')');
        }
        return require.cache[modulePath];
    };
    /** @ignore */


}());
