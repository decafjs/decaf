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
