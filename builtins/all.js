/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/7/13
 * Time: 5:06 PM
 */

/**
 * This file loads and configures the builtin object and the shell.
 * @fileoverview
 */

/*global global:true, builtin: true, load, java */

// ringo does:
// Object.defineProperty(this, "global", { value: this });
global = this;
global.arguments = arguments;

global.__dirname = java.lang.System.getProperty('user.dir');

(function() {
    "use strict";

    var prefix = java.lang.System.getProperty('decaf') + '/';
    global.builtin = {
        decaf: prefix,
        include : function(file) {
            load(prefix + 'builtins/' + file);
        }
    };
    builtin.include('decaf.js');
    builtin.include('extensions.js');
    builtin.include('atexit.js');
    builtin.include('process.js');
    builtin.include('rhino.js');
    builtin.include('console.js');
    builtin.include('print_r.js');
    builtin.include('fs.js');
    builtin.include('require.js');
    builtin.include('include.js');

}());

/**
 * shorthand function to print a string via console.log
 *
 * @global
 * @param {string} s - string to print
 */
function print(s) {
    console.log(s);
}

/**
 * shorthand function to dump an object via console.log
 *
 * @param {object} o - object to dump
 * @param {int} depth - how deep to recurse dumping object
 */
function dump(o, depth) {
    console.log(builtin.print_r(o, depth || 4, ' ', 0));
}

/**
 * Short hand function to dump an object to the debugger Evalutate tab.
 *
 * Easier to type than dump() when using the visual debugger.
 *
 * @param {object} o - object to dump
 * @param {int} depth - how deep to recurse dumping object
 */
function d(o, depth) {
    return builtin.print_r(o, depth || 4, ' ', 0);
}

include('builtins/shell.js');
