/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 4:03 PM
 */

/*global builtin, Packages */
(function() {
    var lock = {},
        scopes = [];

    var allocScope = sync(function() {
        var scope;
        if (!scopes.length) {
            var cx = Packages.org.mozilla.javascript.Context.enter();
            try {
                scope = cx.initStandardObjects();
            }
            finally {
                cx.exit();
            }
        }
        else {
            console.log('hit')
            scope = scopes.pop();
        }
        return scope;
    }, lock);

    var freeScope = sync(function(scope) {
        scopes.push(scope);
    }, lock);

    /**
     * @module builtin.rhino
     * @type {{getScope: Function, releaseScope: Function, runScript: Function, createScope: Function}}
     */
    builtin.rhino = {
        /**
         *
         * @param o
         * @returns {*}
         */
        getScope : function(o) {
            var scope = allocScope();
            if (!scope.___jst_initialized) {
                for (var g in global) {
                    scope[g] = global[g];
                }
                builtin.applyExtensions(scope);
                scope.global = global;
                scope.___jst_initialized = true;
            }
            for (var i in o) {
                scope[i] = o[i];
            }
            return scope;
        },

        /**
         *
         * @param scope
         */
        releaseScope: function(scope) {
            freeScope(scope);
        },

        /**
         *
         * @param src
         * @param filename
         * @param lineNumber
         * @param scope
         * @returns {*}
         */
        runScript   : function(src, filename, lineNumber, scope) {
            filename = filename || 'unknown';
            lineNumber = lineNumber || 1;
            scope = scope || global;
            var cx = org.mozilla.javascript.Context.enter(),
                ret;
            try {
                ret = cx.evaluateString(scope, src, filename, lineNumber, null);
            }
            finally {
                cx.exit();
            }
            return ret;
        },

        /**
         *
         * @returns {*}
         */
        createScope : function() {
            var cx = Packages.org.mozilla.javascript.Context.enter(),
                scope;
            try {
                scope = cx.initStandardObjects();
            }
            finally {
                cx.exit();
            }
            return scope;
        }
    };

}());
