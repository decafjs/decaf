/*global require */

var http = require('http');

http.createServer(function(req, res) {
    res.sendFile('examples/anchor.png');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
