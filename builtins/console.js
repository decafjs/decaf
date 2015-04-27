/**
 * # Builtin global console singleton.
 *
 * This class implements browser-like console singleton appropriate for server-side.
 *
 * The console object is globally available in any JavaScript code you write for DecafJS.
 * @class console
 * @singleton
 */

(function () {
    var BufferedReader    = java.io.BufferedReader,
        InputStreamReader = java.io.InputStreamReader,
        stdin             = new BufferedReader(new InputStreamReader(java.lang.System.in));

    global.console = {
        /**
         * Read a line from the console/terminal (stdin)
         *
         * @return {String} the line read from the terminal
         */
        readLine  : function () {
            var s = stdin.readLine();
            if (s) {
                return String(s);
            }
            return null;
        },
        /**
         * Output one or more strings to the console.
         *
         * @method log
         * @param {String...} things to display on the console
         */
        /** @ignore */
        log       : function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                var arg = arguments[i];
                if (arg === undefined) {
                    arg = 'undefined';
                }
                java.lang.System.out.println(arg);
            }
        },
        /**
         * Dump a JavaScript object to stdout.
         *
         * The dump recursively prints members of the object up to the specified depth.
         *
         * A best effort is made to dump wrapped Java objects as well.  This will show those objects' member variables and methods.
         *
         * ### Arguments:
         * - {Mixed} o - the variable to be dumped
         * - {Number} n - optional maximum depth for recursion while dumping the object.  Defaults to 4.
         *
         * @method dir
         * @param {mixed} o - object to dump
         * @param {Number} n - depth (default 4)
         */
        dir       : function (o, n) {
            n = n || 8;
            java.lang.System.out.println(builtin.print_r(o, n));
        },
        /**
         * Interpolate an object into the format string and output to the console.
         *
         * This method is derived from String.prototype.supplant as described by Douglas Crockford here:
         * - http://javascript.crockford.com/remedial.html
         *
         * ### Example:
         *
         * ```javascxript
         * param = {domain: 'valvion.com', media: 'http://media.valvion.com/'};
         * console.format("{media}logo.gif", param);
         * ```
         * prints "http://media.valvion.com/logo.gif".
         *
         * @param fmt
         * @param o
         */
        format    : function (fmt, o) {
            o = o || {};
            java.lang.System.out.println(fmt.replace(
                /\{([^{}]*)\}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            ));
        },
        /**
         * Write strings to stderr
         *
         * @method error
         * @param {String...} - things to display to stderr
         */
        error     : function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                var arg = arguments[i];
                if (arg === undefined) {
                    arg = 'undefined';
                }
                java.lang.System.err.println(arg);
            }
        },
        /**
         * Write strings to stderr
         *
         * @method warn
         * @param {String...} - things to display to stderr
         */
        warn      : function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                var arg = arguments[i];
                if (arg === undefined) {
                    arg = 'undefined';
                }
                java.lang.System.err.println(arg);
            }
        },
        /**
         * Dump a JavaScript or Rhino Exception/Error to stdout.
         *
         * @param {Error} e - the exception object to dump.
         */
        exception : function (e) {
            var text = '';
            text += '**** EXCEPTION ****\n';
            if (!NASHORN && e instanceof org.mozilla.javascript.RhinoException) {
                text += e.details() + '\n';
            }
            else if (!NASHORN) {
                text += e.toString() + '\n';
            }
            if (typeof e.getScriptStackTrace === 'function') {
                text += e.getScriptStackTrace() + '\n';
            }
            if (typeof e.getWrappedException === 'function') {
                var ee = e.getWrappedException();
                var sw = new java.io.StringWriter(),
                    pw = new java.io.PrintWriter(sw);
                ee.printStacKTrace(new java.io.PrintWriter(sw));
                text += String(sw.toString()) + '\n';
            }
            if (e.stack) {
                text += e.stack;
            }
            this.error(text);
        }
    };
}());
