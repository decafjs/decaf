/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/7/13
 * Time: 5:06 PM
 */

/*global global:true, builtin: true, load, java */

// ringo does:
// Object.defineProperty(this, "global", { value: this });
/**
 * # DecafJS Bootstrap Loader
 *
 * This file is the very first thing loaded into rhino.
 *
 * @fileoverview
 * @class global
  */
/** @private */
(function(that, arguments) {
    /**
     * ## global
     *
     * There is no DOM in the rhino/decafjs environment, so there is no "window" object.  Instead, there is a
     * global variable named "global."
     *
     * Any access to "global.some_var" is the same as an access to "some_var" as long as there is no other "some_var" variable in scope.  That is, any global variable named "some_var" can be accessed as "global.some_var" or "some_var."
     *
     * <b>For example:</b>
     *
     * ```javascript
     * some_var = 10;
     * console.log(some_var); // -> 10
     * console.log(global.some_var); // -> 10
     * global.some_var = 20;
     * console.log(some_var); // -> 20
     * console.log(global.some_var); // -> 20
     * ```
     */
    global = that;

    /**
     * ## global.arguments
     *
     * Command line arguments to program as an Arguments array.
     *
     * @property {Arguments} arguments
     */
    global.arguments = arguments;

    /**
     * ## global.__dirname
     *
     * Current directory where decaf was run from.
     *
     * @property __dirname
     */
    global.__dirname = java.lang.System.getProperty('user.dir');
/** @private */
}(this, arguments));

/**
 * ## print(s)
 *
 * Shorthand function to print a string via console.log
 *
 * ### Arguments:
 *  - {string} s - the string to print to the console
 *
 * @method print
 * @param {string} s - string to print
 */
function print(s) {
    console.log(s);
}

/**
 * ## dump(o)
 *
 * Shorthand function to dump an object via console.log
 *
 * ### Arguments:
 *  - {Object} - the JavaScript object to dump
 *
 * @method dump
 * @param {object} o - object to dump
 * @param {int} depth - how deep to recurse dumping object
 */
function dump(o, depth) {
    console.log(builtin.print_r(o, depth || 4, ' ', 0));
}

/**
 * ## d(o)
 *
 * Short hand function to dump an object to the debugger Evalutate tab.
 *
 * ### Arguments:
 *  - {Object} o - the object to dump
 *
 * @method d
 * @param {object} o - object to dump
 * @param {int} depth - how deep to recurse dumping object
 */
function d(o, depth) {
    return builtin.print_r(o, depth || 4, ' ', 0);
}

/**
 *  ## global.builtins
 *
 * The bootstrap process loads the remaining files from the builtins directory.  Most of these files augment the global.builtins object.
 */

(function() {
    "use strict";

    var prefix = java.lang.System.getProperty('decaf') + '/';
    global.builtin = {
        decaf: prefix,
        include : function(file) {
            load(prefix + 'builtins/' + file);
        }
    };
    builtin.include('assert.js');
    builtin.include('unit.js');
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
 * ## REPL
 *
 * The builtin/shell loads the first .js file from the command line and runs it, then exits.
 *
 * If there is no .js file on the command line, it enters an interactive REPL mode where it reads JavaScript from the console and executes it.
 *
 */
include('builtins/shell.js');
