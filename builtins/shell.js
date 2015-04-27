/**
 * @class global
 * @singleton
 *
 * # Application bootstrap
 *
 * Any .js files specified on the command line are loaded:
 *
 * - If at least one .js file is present, the main() function specified is called, if defined by the application.
 * - If no .js files are present, the REPL is run.
 *
 * The REPL uses jline to provide command line history and editing.
 *
 */

/** @ignore */
/*global global, Packages, include, require, builtin */
(function () {
    "use strict";

    var args = global.arguments;

    /**
     * # shellMain()
     *
     * The guts of the command line interpreter.  This is the REPL.
     *
     * The REPL uses jline to provide command line history and editing.
     *
     * @private
     */
    function shellMain() {
        var rhino = require('builtin/rhino');

        var input = new Packages.jline.console.ConsoleReader(),
            historyFile = new java.io.File(java.lang.System.getProperty('user.home') + '/.decafrc'),
            history = new Packages.jline.console.history.FileHistory(historyFile),
            TerminalFactory = Packages.jline.TerminalFactory,
            line;

        builtin.atExit(function () {
            history.flush();
            // jline2 supposedly installs its own JVM shutdown hook to restore the terminal
//            TerminalFactory.get().restore();
        });

        input.setHistory(history);
        while (line = input.readLine('decaf> ')) {
            if (!line) {
                console.log('line null')
            }
            try {
                var result = rhino.runScript(line);
                if (result !== undefined) {
                    console.log('' + result);
                }
            }
            catch (e) {
                e.dumpText();
            }
        }
    }

    var argv = [],
        runShell = true;
    for (var i = 0, len = args.length; i < len; i++) {
        var arg = args[i];
        if (arg.endsWith('.js')) {
            if (runShell) {
                try {
                    //console.log('include ' + arg)
                    include(arg);
                }
                catch (e) {
                    console.exception(e);
                    builtin.process.exit(1);
                    //throw e;
                }
                runShell = false;
            }
            else {
                argv.push(arg);
            }
        }
        else {
            argv.push(arg);
        }
    }

    builtin._main();
    if (global.main) {
        global.main.apply(global, argv);
    }
    else if (runShell) {
        shellMain();
    }

    if (!runShell) {
        while (builtin._idle()) {
            java.lang.Thread.sleep(1);
        }
    }

}());
