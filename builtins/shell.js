/*global global, Packages, include, require, builtin */
(function () {
    /**
     * @module builtin
     * @submodule shell
     */
    "use strict";

    var args = global.arguments;

    /*
     * The guts of the command line interpreter
     *
     * @param none
     * @function
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
                include(arg);
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

}());

