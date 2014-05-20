/**
 * @fileoverview A little more complex HTTP server example.
 *
 * HTTP request object (req) tested with binary and text uploads.
 */
/*global require */

var http = require('http'),
    fs = require('fs');

function serveForm() {
    var html = '<html><head><title>Form test</title></head><body>';
    html += '<form action="/testPost" method="post" enctype="multipart/form-data">';
    html += 'File: <input name="upload" type="file"> <input type="submit">';
    html += '</form>'
    html += '</body></html>';
    return html;
}

http.createServer(function(req, res) {
    if (req.uri === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end(serveForm());
    }
    else if (req.uri === '/testPost') {
        fs.writeFile('foo', req.data.upload.content);
        if (req.data.upload && req.data.upload.size > 100) {
            req.data.upload.content = '';
        }
        console.dir(req.data);
        res.writeHead(200, { 'Content-Type': 'text/plain'});
        res.end(builtin.print_r(req.data));
    }
    else {
        console.log(req.uri);
        res.writeHead(200, { 'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
