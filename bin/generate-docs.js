#!/usr/bin/env decaf

/*global require */

var File = require('File'),
    exit = require('process').exit,
    dox = require('dox');

var directories = [
    'builtins',
//    'languages',
    'modules'
];

function main(outPath) {
    outPath = outPath || 'docs/docRoot/api';

    var outFile = new File(outPath);
    outFile.removeDirectory();
    outFile.makeDirectory(true);

    var modules = {},
        globals = {},
        docs = {},
        docCount = 0;

    function processDoc(doc) {
        var module = globals;

        docCount++;
        decaf.each(doc, function(item) {
            var myModule = module;
            decaf.each(tags, function(tag) {
                switch (tag.type.toLowerCase()) {
                    case 'module':
                        if (tag.string === undefined) {
                            debugger;
                        }
                        myModule = module = modules[tag.string] = (modules[tag.string] || {});
                        break
                    case 'global':
                        myModule = globals;
                        break;
                    case 'memberof':
                        if (tag.parent=== undefined) {
                            debugger;
                        }
                        modules[tag.parent] = modules[tag.parent] || {};
                        myModule = modules[tag.parent];
                        break;
                }
            });
            if (item.ctx && !item.isPrivate) {
                myModule[item.ctx.name] = item;
            }
        });
    }

    decaf.each(directories, function(dir) {
        var f = new File(dir);
        if (!f.isDirectory()) {
            console.log(dir + ' is not a directory');
            exit(1);
        }
        decaf.each(f.list(), function(path) {
            if (path === 'process.js') {
                debugger;
                console.dir(doc);
            }
            var f = new File(dir + '/' + path),
                doc;
            if (f.isDirectory()) {
                path = dir + '/' + path;
                console.log(path + ' is a directory');
                var index = new File(path + '/index.js');
                if (index.exists()) {
                    doc = docs[path + '/index.js'] = dox.parseComments(index.readAll(), { raw: false });
                    processDoc(doc);
                }
                var lib = new File(path + '/lib');
                if (lib.isDirectory()) {
                    decaf.each(lib.list(), function(filename) {
                        f = new File(path + '/lib/' + filename);
                        if (f.exists()) {
                            doc = docs[path + '/lib/' + filename] = dox.parseComments(f.readAll(), { raw: false });
                            processDoc(doc);
                        }
                    });
                }
            }
            else {
                console.log(dir + '/' + path + ' is a file');
                doc = docs[dir + '/' + path] = dox.parseComments(f.readAll(), { raw: false });
                processDoc(doc);
           }
        });

    });
    console.log(docCount + ' documents')
    console.log('>>>>> GLOBALS');
    decaf.each(globals, function(value, key) {
        console.log('>> ' + key);
    })
//    console.dir(globals);
    console.log('>>>>> MODULES');
    decaf.each(modules, function(value, key) {
        console.log('>> ' + key);
        decaf.each(value, function(value, member) {
            console.log('>>>> ' + key + '.' + member);
        });
    })
//    console.dir(modules);
}