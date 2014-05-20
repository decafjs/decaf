/** @module console */

(function() {
    var {BufferedReader, InputStreamReader} = java.io,
        stdin = new BufferedReader(new InputStreamReader(java.lang.System.in));

    global.console = {
        /**
         * Read a line from the console/terminal (stdin)
         *
         * @returns {string} line read from terminal
         */
        readLine: function() {
            var s = stdin.readLine();
            if (s) {
                return String(s);
            }
            return null;
        },

        /**
         * @memberOf console
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
         * @memberOf console
         * @param o
         * @param n
         */
        dir: function(o, n) {
            n = n || 4;
            java.lang.System.out.println(builtin.print_r(o, n));
        },
        /**
         * @memberOf console
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
         * @memberOf console
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
         * @memberOf console
         * @param e
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
