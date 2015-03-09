/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 4:03 PM
 */

/**
 * # Builtin Rhino Methods
 *
 * Rhino being a .jar file with Java classes and methods can be scripted just as any Java.
 *
 * The builtin.rhino singleton provides an interface for JavaScript programs to call a few Rhino methods.  Of particular interest would be the runScript() method, which is used within
 * require() and include().
 */
/** @private */
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
     * @private
     * @type {{getScope: Function, releaseScope: Function, runScript: Function, createScope: Function}}
     */
    builtin.rhino = {
        /**
         * # rhino.createScope() : scope
         *
         * This method allocates a Rhino scope and initializes it with standard JavaScript objects.
         *
         * You will want to call rhino.releaseScope() to free the scope when you are done with it.
         *
         * ### Returns:
         *
         * - {Global Object} scope - the initialized scope.
         *
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
        },

        /**
         * ## rhino.getScope(o) : scope
         *
         * Allocate and initialize a global scope for a JavaScript engine context.  You may initialize the allocated global scope with your own variables by passing in an object whose members will be merged.
         *
         * You will want to call rhino.releaseScope() to free the scope when you are done with it.
         *
         * ### Arguments:
         *
         *  - {Object} o - (optional) object to merge into the allocated scope
         *
         * ### Returns:
         *
         * - {Global Object} scope - an initialized scope
         *
         * @param o
         * @returns {*}
         */
        getScope : function(o) {
            var scope = allocScope();
            if (!scope.___jst_initialized) {
                decaf.extend(scope, global);
                builtin.applyExtensions(scope);
                scope.global = global;
                scope.___jst_initialized = true;
            }
            decaf.extend(scope, o || {});
            return scope;
        },

        /**
         * ## rhino.releaseScope(scope)
         *
         * Free/release a scope created with rhino.getScope().
         *
         * The Rhino Java code may allocate memory and objects behind the scenes that need to be cleaned up to prevent memory leaks.
         *
         * ### Arguments:
         *
         * - {Global Object} scope - the scope to release
         *
         * @param scope
         */
        releaseScope: function(scope) {
            freeScope(scope);
        },

        /**
         * ## rhino.runScript(src, filename, lineNUmber, scope) : {Mixed}
         *
         * This is a more powerful way to eval() a string of JavaScript, as it allows you to specify a filename and line number as well as a Global Object scope for the execution of the JavaScript.
         *
         * Only the src parameter is required.  However, if you provide a filename and line number, any JavaScript exceptions and stack traces will reflect the file and line in that file of the offending code.
         *
         * ### Arguments:
         *
         * - {String} src - the source code of the JavaScript to execute, as a string.
         * - {String} filename - (optional) the name of the file.  Defaults to 'unknown'
         * - {int} lineNumber - {optional) the starting line number for exceptions purposes.  Defaults to 1.
         * - {Global Object} scope - (optional) the global object to be used during the script's execution.  Defaults to global.
         *
         * ### Returns:
         *
         * - {Mixed} ret - whatever the script returns.
         *
         * @param src
         * @param filename
         * @param lineNumber
         * @param scope
         * @returns {Mixed}
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
        }

        /** @private */
    };

}());
