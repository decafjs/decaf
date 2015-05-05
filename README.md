## Introducing DecafJS


<a href="http://www.youtube.com/watch?feature=player_embedded&v=bzkRVzciAZg
" target="_blank"><img src="http://img.youtube.com/vi/bzkRVzciAZg/0.jpg" 
alt="Smackdown" width="240" height="180" border="10" /></a>


Decaf is a platform built on the [Rhino JavaScript runtime](http://en.wikipedia.org/wiki/Rhino_(JavaScript_engine)).  

Rhino is an open source JavaScript engine, developed entirely in Java, and managed by the Mozilla Foundation.  It runs on runtimes for Java 6, Java 7, and Java 8.  Under the hood, your JavaScript is compiled to Java byte codes and run within the JVM.  The JVM then optimizes the byte codes using its JIT technology.

Rhino has been worked on since the 1990s, is stable, has a built-in debugger with GUI, has [built-in capability to interface to the entire Java ecosphere from JavaScript](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino/Scripting_Java), and since it runs on the JVM you get native Threads for your JavaScript.

*Decaf is also fully portable to any platform that has at least a Java 6 implementation.*

**Decaf's API is fully synchronous** - you write structured and procedural programs like you do in most any traditional programming language.  You can implement evented applications, but it is not required.

One of the goals of Decaf is to write everything in JavaScript.  Decaf itself is a shell script that launches your JavaScript application in the Rhino environment extended with the core Decaf API.  Decaf does include two .jar files: Rhino and JLine; JLine is used by the REPL mode to provide command line history.

## Examples

### An example: Web Server
This simple Web server uses the Decaf core http module.  If the source code looks familiar, it is the exact same code as shown on the nodejs.org WWW site.

```javascript
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
```

You can find this code in the `examples/http-test.js` file in this repository.  To run it:
```sh
% ./bin/decaf ./examples/http-test.js
```

Note: Decaf's http implementation is synchronous and threaded.  It will scale up to use all the cores in your server without any effort on your part.

To use the visual debugger:
```sh
% ./bin/decaf debug ./examples/http-test.js
```

### An example: Threading

```javascript
// examples/thread-test.js
var Thread = require('Threads').Thread;

var sharedGlobal = 0;

function main() {
    new Thread(function() {
    	while (1) {
	    Thread.sleep(1);
            console.log('sharedGlobal = ' + sharedGlobal);
        }
    }).start();
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            sharedGlobal++;
        }
    }).start();
}
```

### Synchronous JavaScript rocks!

```javascript
SQL.beginTransaction();
try {
    SQL.update('INSERT INTO table1 ' + values1);
    SQL.update('INSERT INTO table2 ' + values2);
    // both queries succeeded.
    SQL.commit();
}
catch (e) {
    // oh no!  DB would be corrupt without transactions.
    SQL.rollback();
    throw e;
}
```
<br/>Where's my nested callback hell?

### REPL

```javascript
% ./bin/decaf
decaf> console.log('hello')
hello
decaf> var x = { a: 1, b: 2 };
decaf> console.dir(x)
(object)
 [a] (number) 1
 [b] (number) 2
decaf>
```

## Get Decaf

It is highly recommended that you install Decaf via bower (see instructions below).

### GitHub Repository 
One option to get Decaf is to clone the GitHub repository. Something like:

```sh
% git clone git@github.com:decafjs/decaf decaf
% cd decaf
```

From here, you can run decaf, try the examples/ programs, and so on.

```sh
% ./bin/decaf examples/thread-test.js
```

#### Install Decaf System-wide
```
% ./bin/decaf install
```

Decaf will install itself in `/usr/local/decaf`.  It copies the decaf shell script to `/usr/local/bin/decaf`.  You may be prompted to enter your system password as the installation uses the `sudo` command.

*Make sure /usr/local/bin is on your path!*

#### Uninstall Decaf
```
% decaf uninstall
```

This removes all the files in `/usr/local/decaf` and the decaf shell script from `/usr/local/bin`.

### Bower

Decaf is fully compatible with the bower package manager.  You can use bower to install Decaf as part of a project instead of cloning the GitHub repository (bower actually clones the repo anyhow).

*For the short term, you will be using the master branch of the repo until it is ready for semantic versioning.*

```sh
% bower install git://github.com/decafjs/decaf#master
```

Or within your bower.json:

```javascript
{
	name: 'my app',
    ...
    dependencies: {
    	...
    	"decaf" : "git://github.com/decafjs/decaf#master"
        ...
    }
}
```

This will install Decaf in your ./bower_components/decaf directory.  To run Decaf from your project directory, you probably will want to set up a couple of shell scripts.  Assume your application is ./app.js.

Create ./run.sh:

```sh
#!/bin/sh
./bower_components/decaf/bin/decaf ./app.js
```

This allows you to start your Decaf application from your project root directory:

```sh
% ./run.sh
```

Also create ./debug.sh:

```sh
#!/bin/sh
./bower_components/decaf/bin/decaf debug ./app.js
```

And ./decaf.sh, so you can use REPL mode or run additional scripts:

```sh
#!/bin/sh
./bower_components/decaf/bin/decaf $@
```

*Decaf does not support alternate bower component installation directories.*

## Modules & require()

Modules are loaded via the global require() function.  The Decaf implementation of require() is CommonJS Modules 1.1 compliant, but also implements enough of NodeJS require() to load modules for NodeJS.  The Decaf implementation also will load modules installed via Bower.

Please read the [guide to require() and modules](./index.html#!/guide/require).

Decaf comes with a handful of useful modules; these are in the repository in the modules/ directory.  There are wiki pages for each of these modules.

There are a [number of modules already created for Decaf](https://github.com/decafjs) that can be installed using Bower.


## License
Decaf is free to use under the MIT license.  See the LICENSE file in this repository.

