/**
 * @module mimetypes
 * @filedescription mimetypes
 *
 * ### Synopsis
 *
 * var mimeTypes = require('MimeTypes');
 *
 * ### Description
 *
 * MimeTypes is a hash/object.  The key in the object is file extension, the value is MIME type (e.g. HTTP content-type value).
 *
 * The system mime.types file is loaded, if it can be found.  For Linux, the file is expected to exist in /etc/mime.types.  For OSX, it's expected in /Private/etc/apache2/mime.types.
 *
 * ### Throws
 * This module throws an error at require() time if the mime.types file cannot be found.
 */

/*global require, exports:true */
"use strict";

var File = require('File');

var filename = null;

// locate mime.types file
decaf.each([
    '/etc/mime.types',
    '/Private/etc/apache2/mime.types'
], function (path) {
    if (new File(path).isFile()) { // fs.exists(path)) {
        filename = path;
    }
});

if (!filename) {
    throw 'MimeTypes: Cannot find mime.types file.';
}

/**
 * Array of mime types - key is file extension, value is content-type
 * @type {{}}
 */
var mimeTypes = {};
var lines = new File(filename).readAll().split(/\n/); // fs.readFile(filename).split(/\n/);
decaf.each(lines, function (line) {
    line = line.trim();
    if (line.length == 0 || line.substr(0, 1) === '#') {
        return;
    }
    var parts = line.split(/\s+/);
    if (parts.length == 1) {
        return;
    }
    var contentType = parts.shift();
    decaf.each(parts, function (extension) {
        mimeTypes[extension] = contentType;
    });
});

decaf.extend(exports, {
    mimeTypes: mimeTypes
});
