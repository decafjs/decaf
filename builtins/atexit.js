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

/**
 * Provide functionality to register functions to be run at start and exit of decaf.
 * @fileoverview
 */
/*global java, builtin */
(function () {
    var exitFuncs = [],
        startFuncs = [];

    decaf.extend(builtin, {
        /**
         * Register function to be run at exit
         *
         * @method atExit
         * @param func
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