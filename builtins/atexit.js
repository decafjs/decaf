/**
 * @module builtin
 * @submodule atexit
 */

/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 4:39 PM
 */

"use strict";

/*global java, builtin */
/**
 * Provide functionality to register functions to be run at start and exit of decaf.
 * @class builtin
 * @module builtin
 */
(function () {
    var exitFuncs = [],
        startFuncs = [];

    decaf.extend(builtin, {
        /**
         * Register function to be run at exit
         *
         * @method atExit
         * @param {Function} func - function to be run at exit
         */
        atExit : function ( func ) {
            exitFuncs.push(func);
        },
        /**
         * Register function to be run at exit
         *
         * @method atexit
         * @param func
         */
        atexit  : function ( func ) {
            exitFuncs.push(func);
        },
        /**
         * Register function to be run at startup
         *
         * @method atStart
         * @param func
         */
        atStart : function ( func ) {
            startFuncs.push(func);
        },
        /**
         * Register function to be run at startup
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