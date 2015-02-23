(function() {
    var {BufferedReader, InputStreamReader} = java.io,
        stdin = new BufferedReader(new InputStreamReader(java.lang.System.in));

    /**
     * Implement brower-like console singleton appropriate for server-side.
     *
     * @module builtin
     * @class console
     */
    global.console = {
        /**
         * Read a line from the console/terminal (stdin)
         *
         * @method readLine
         * @returns {string} - line read from terminal
         */
        readLine: function() {
            var s = stdin.readLine();
            if (s) {
                return String(s);
            }
            return null;
        },

        /**
         * @method log
         * @param [...] - things to display on the console
         */
        log: function() {
            for (var i=0,len=arguments.length; i<len; i++) {
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
         * @method dir
         * @param {mixed} o - object to dump
         * @param {int} n - depth (default 4)
         */
        dir: function(o, n) {
            n = n || 4;
            java.lang.System.out.println(builtin.print_r(o, n));
        },
        /**
         * Write strings to stderr
         *
         * @method error
         * @param [...] - things to display to stderr
         */
        error: function() {
            for (var i=0,len=arguments.length; i<len; i++) {
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
         * @param [...] - things to display to stderr
         */
        warn: function() {
            for (var i=0,len=arguments.length; i<len; i++) {
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
        exception: function(e) {
            var text = '';
            text += '**** EXCEPTION ****\n';
            if (e instanceof org.mozilla.javascript.RhinoException) {
                text += e.details() + '\n';
            }
            else {
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
