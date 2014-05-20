/** @module builtin.process */
/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 6:06 PM
 */

/*global builtin, java */
(function() {
    "use strict";
    var Runtime = java.lang.Runtime;

    builtin.process = {
        /**
         *
         * @param secs
         */
        sleep  : function(secs) {
            java.lang.Thread.sleep(secs * 1000);
        },

        /**
         *
         * @param usecs
         */
        usleep : function(usecs) {
            java.lang.Thread.sleep(usecs);
        },

        /**
         *
         * @param code
         */
        exit   : function(code) {
            java.lang.System.exit(code || 0);
        },

        /**
         *
         * @returns {*}
         */
        getFreeMemory: function() {
            return Runtime.getRuntime().freeMemory();
        },

        /**
         *
         * @returns {*}
         */
        getMaxMemory: function() {
            return Runtime.getRuntime().maxMemory();
        },

        /**
         *
         * @returns {*}
         */
        getTotalMemory: function() {
            return Runtime.getRuntime().totalMemory();
        }
    }
}());
