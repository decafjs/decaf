/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 4:39 PM
 */

/**
 * # builtin atExit, atStart
 *
 * Provide functionality to register functions to be run at start and exit of decaf.
 *
 * Multiple atStart() and atExit() handlers may be registered.
 *
 * The atStart methods are all called, in the order they are registered, after the JavaScript file on the command line is loaded, or if none present, before the REPL is run.
 *
 * The atExit methods are all called in the order they are registered just before decaf exits.
 *
 * @module builtin
 * @submodule atexit
 */

/** @private */
"use strict";

/*global java, builtin */
(function () {
    var exitFuncs = [],
        startFuncs = [];

    decaf.extend(builtin, {
        /**
         * ## builtin.atExit(func)
         *
         * Register function to be run at exit
         *
         * @method atExit
         * @param {Function} func - function to be run at exit
         */
        atExit : function ( func ) {
            exitFuncs.push(func);
        },
        /**
         * ## builtin.atexit(func)
         *
         * Register function to be run at exit
         *
         * Note: this is an alias for atExit()
         *
         * @method atexit
         * @param func
         */
        atexit  : function ( func ) {
            exitFuncs.push(func);
        },
        /**
         * ## builtin.atStart(func)
         *
         * Register function to be run at startup
         *
         * @method atStart
         * @param func
         */
        atStart : function ( func ) {
            startFuncs.push(func);
        },
        /**
         * ## builtin.atstart(func)
         *
         * Register function to be run at startup
         *
         * Note: this is an alias for atStart()
         *
         * @method atStart
         * @param func
         */
        atstart : function ( func ) {
            startFuncs.push(func);
        },
        /**
         * Execute all the startup functions
         *
         * @method _main
         * @private
         */
        _main   : function () {
            decaf.each(startFuncs, function ( fn ) {
                fn();
            });
        }
    });

    java.lang.Runtime.getRuntime().addShutdownHook(java.lang.Thread(function () {
        print('\nexiting');
        try {
            decaf.each(exitFuncs, function ( fn ) {
                try {
                    fn();
                }
                catch ( e ) {
                }
            });
        }
        catch ( e ) {

        }
    }));

}());