/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 3:35 PM
 */

/*global require, builtin */

/**
 * ## builtin.applyExtensions(scope)
 *
 * Apply assorted extensions to JavaScript primitives in the specified scope.
 *
 * Typically the scope will be "global" (global.global), but if you create a new JavaScript context, you may want to apply these extensions to that context's global.
 *
 * *Note:  These extensions are applied to the global object in Decaf.*
 *
 * ### Arguments:
 * - {Object} scope - the global scope to which extensions are to be added.
 *
 * @memberOf builtin
 * @param scope
 */
builtin.applyExtensions = function ( scope ) {

    /**
     * ## String.prototype.endsWith(s) : boolean
     *
     * Test this string to see if it ends with another string.
     *
     * ### Arguments:
     * - {String} s - the string to test this string ends with.
     *
     * ### Returns:
     * - true if this string ends with the argument string.
     */
    if ( !scope.String.prototype.endsWith ) {
        Object.defineProperty(scope.String.prototype, 'endsWith', {
            enumerable   : false,
            configurable : false,
            writable     : false,
            value        : function ( searchString, position ) {
                position = position || this.length;
                position = position - searchString.length;
                var lastIndex = this.lastIndexOf(searchString);
                return lastIndex !== -1 && lastIndex === position;
            }
        });
    }

    /**
     * String.prototype.trimLeft()
     *
     * Strip all leading spaces from this string.
     *
     * @returns this
     */
    scope.String.prototype.trimLeft = function () {
        return this.replace(/^\s+/, '');
    };

    /**
     * ## String.prototype.trimRight()
     *
     * Remove trailing spaces from string.
     *
     * @returns {XML|*|string|void}
     */
    scope.String.prototype.trimRight = function () {
        return this.replace(/\s+$/, '');
    };

    scope.Number.prototype.commaFormat = function () {
        var parts = x.toString().split(".");
        return parts[ 0 ].replace(/\B(?=(\d{3})+(?=$))/g, ",") + (parts[ 1 ] ? "." + parts[ 1 ] : "");
    };
    /** @private */
    decaf.extend(scope.Error.prototype, {
        /**
         * Error.prototype.asText() : Stirng
         *
         * Format this Error as a human readable string.
         *
         * ### Returns
         * - {String} the formatted string representing the Error.
         *
         * ### Example:
         *
         * ```javascript
         * try {
         *   some_func_that_throws_error();
         * }
         * catch (e) {
         *   console.log(e.asText());
         * }
         * ```
         * @returns {string}
         */
        asText   : function () {
            var e = this;
            var text = '';
            if ( !NASHORN && e instanceof org.mozilla.javascript.RhinoException ) {
                text += e.details() + '\n';
            }
            else {
                text += e.toString() + '\n';
            }
            if ( e.extra ) {
                text += builtin.print_r(e.extra);
            }
            if ( typeof e.getScriptStackTrace === 'function' ) {
                text += e.getScriptStackTrace() + '\n';
            }
            if ( typeof e.getWrappedException === 'function' ) {
                var ee = e.getWrappedException();
                var sw = new java.io.StringWriter(),
                    pw = new java.io.PrintWriter(sw);
                ee.printStacKTrace(new java.io.PrintWriter(sw));
                text += String(sw.toString()) + '\n';
            }
            if ( e.stack ) {
                var trace = e.stack;
                decaf.each(trace.split('\n'), function ( line ) {
                    if ( line.length ) {
                        var l = line.replace(/^\s+at\s+/, '').replace(/:\d+.*$/, '');
                        if ( require.isRequiredFile(l) ) {
                            l = line.replace(/^.*:/, '').replace(/\s+.*$/, '');
                            text += line.replace(l, parseInt(l, 10) - 7) + '\n';
                        }
                        else {
                            text += line + '\n';
                        }
                    }
                });
                text = text.replace(/\n$/, '');
            }
            return text;

        },
        /**
         * ## Error.prototype.dumpText()
         *
         * Print human readable information about this Error to stdout.
         *
         * Example:
         *
         * ```javascript
         * try {
         *   some_func_that_throws_error();
         * }
         * catch (e) {
         *   e.dumpText();
         * }
         * ```
         */
        dumpText : function () {
            java.lang.System.out.println(this.asText());
        }
/** @private */
    });

};

builtin.applyExtensions(global);
