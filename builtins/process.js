/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 6:06 PM
 */

/** @module builtin.process */

/**
 * # builtin.process
 *
 * This builtin singleton provides low-level process related methods.
 *
 * Rather than using this singleton's methods directly, you will likely want to require('process') instead.  That
 * module provides a much richer set of methods.  These methods are intended for use during the bootstrap process.
 */

/** @private */
/*global builtin, java */
(function () {
    "use strict";
    var Runtime = java.lang.Runtime;

    builtin.process = {
        /**
         * ## process.sleep(secs)
         *
         * Put current thread to sleep (block) for specified number of seconds.
         *
         * ### Arguments:
         *
         * - {Number} secs - number of seconds to sleep.
         *
         * @param secs
         */
        sleep          : function (secs) {
            java.lang.Thread.sleep(secs * 1000);
        },
        /**
         * ## process.usleep(usecs)
         *
         * Put current thread to sleep (block) for specified number of milliseconds
         *
         * ### Arguments:
         * - {Number} msecs - number of milliseconds to sleep
         *
         * @param msecs
         */
        usleep         : function (msecs) {
            java.lang.Thread.sleep(msecs);
        },
        /**
         * ## process.exit(code)
         *
         * This method causes the application to terminate.
         *
         * ### Arguments:
         *
         * - {Number} code - the exit code for the program
         *
         * @param code
         */
        exit           : function (code) {
            java.lang.System.exit(code || 0);
        },
        /**
         * ## process.getFreeMemory() : Number
         *
         * Returns the amount of free memory in the Java Virtual Machine. Calling the gc method may result in increasing the value returned by freeMemory.
         *
         * ### Returns:
         *
         * - {Number} bytes - an approximation to the total amount of memory currently available for future allocated objects, in bytes.
         *
         * @returns {Number} bytes - an approximation to the total amount of memory currently available for future allocated objects, in bytes.
         */
        getFreeMemory  : function () {
            return Runtime.getRuntime().freeMemory();
        },
        /**
         * ## process.getMaxMemory() : Number
         *
         * Returns the maximum amount of memory that the Java virtual machine will attempt to use. If there is no inherent limit then the value Long.MAX_VALUE will be returned.
         *
         * ### Returns:
         *
         * - {Number} bytes - the maximum amount of memory that the virtual machine will attempt to use, measured in bytes
         *
         * @returns {Number} bytes - the maximum amount of memory that the virtual machine will attempt to use, measured in bytes
         */
        getMaxMemory   : function () {
            return Runtime.getRuntime().maxMemory();
        },
        /**
         * ## process.getTotalMemory() : Number
         *
         * Returns the total amount of memory in the Java virtual machine. The value returned by this method may vary over time, depending on the host environment.
         *
         * Note that the amount of memory required to hold an object of any given type may be implementation-dependent.
         *
         * ### Returns:
         *
         * - {Number} bytes - the total amount of memory currently available for current and future objects, measured in bytes.
         *
         * @returns {Number} bytes - the total amount of memory currently available for current and future objects, measured in bytes.
         */
        getTotalMemory : function () {
            return Runtime.getRuntime().totalMemory();
        },
        /**
         * ## process.gc()
         *
         * Runs the garbage collector. Calling this method suggests that the Java virtual machine expend effort toward recycling unused objects in order to make the memory they currently occupy available for quick reuse. When control returns from the method call, the virtual machine has made its best effort to recycle all discarded objects.
         *
         * The name gc stands for "garbage collector". The virtual machine performs this recycling process automatically as needed, in a separate thread, even if the gc method is not invoked explicitly.
         */
        gc: function() {
            Runtime.getRuntime().gc();
        }
        /** @private */
    }
}());
