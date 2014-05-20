Decaf http API
==============

Decaf provides both a client and server API.  They are distinct/separate.


The http server consists of a Node.js style server:

```javascript
var http = require('http');

http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(1337, '127.0.0.1', 5000);
console.log('Server running at http://127.0.0.1:1337/');
```

<br/>You will find useful information in the documentation for the Request and Response objects.

Note that you may end up using Jolt, which is built on top of the http server API.

The http client provides a simple means to do GET or POST requests to remote servers.  The API is
chainable, so you get something that looks like this:

```javascript
var Client = require('http').Client;

debugger;
var client = new Client('http://google.com').get();

// client.responseText contains the HTML retrieved for the URL specified
```
