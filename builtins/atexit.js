/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 4:39 PM
 */

/**
 * @class builtin.atexit
 * @singleton
 *
 * # builtin atExit, atStart
 *
 * Provide functionality to register functions to be run at start and exit of decaf.
 *
 * Multiple atStart() and atExit() handlers may be registered.
 *
 * The atStart methods are all called, in the order they are registered, after the JavaScript file on the command line is loaded, or if none present, before the REPL is run.
 *
 * The atExit methods are all called in the order they are registered just before decaf exits.
 */

/** @private */
"use strict";

/*global java, builtin */
(function () {
    var exitFuncs = [],
        startFuncs = [],
        idleFuncs = [];

    decaf.extend(builtin, {
        /**
         * Register function to be run at exit
         *
         * @method atExit
         * @param {Function} func - function to be run at exit
         */
        atExit  : function (func) {
            exitFuncs.push(func);
        },
        /**
         * Register function to be run at exit
         *
         * Note: this is an alias for atExit()
         *
         * @method atexit
         * @param func
         */
        atexit  : function (func) {
            exitFuncs.push(func);
        },
        /**
         * Register function to be run at startup
         *
         * @method atStart
         * @param func
         */
        atStart : function (func) {
            startFuncs.push(func);
        },
        /**
         * Register function to be run at startup
         *
         * Note: this is an alias for atStart()
         *
         * @method atstart
         * @param func
         */
        atstart : function (func) {
            startFuncs.push(func);
        },
        /**
         * Add a method to be called in the main thread's idle loop
         * @param func
         */
        onIdle : function( func ) {
            idleFuncs.push(func);
        },
        /**
         * Execute all the startup functions
         *
         * @method _main
         * @private
         */
        _main   : function () {
            decaf.each(startFuncs, function (fn) {
                fn();
            });
        },
        _idle : function() {
            var ret = false;
            decaf.each(idleFuncs, function(fn) {
                ret = fn();
                if (!ret) {
                    return false;
                }
            });
            return ret;
        }
    });

    java.lang.Runtime.getRuntime().addShutdownHook(new java.lang.Thread(function () {
        print('\nexiting');
        try {
            d.each(exitFuncs, function (fn) {
                try {
                    fn();
                }
                catch (e) {
                }
            });
        }
        catch (e) {

        }
    }));

}());