/**
 * Created by mschwartz on 3/19/15.
 */

/*global javafx, require */
// this is for nashorn only!

// Check for fx presence.
if (typeof javafx.application.Application != "function") {
    print("JavaFX is not available.");
    exit(1);
}

$SCRIPTS = [];

var DECAF = java.lang.System.getProperty('decaf');

var Group, WebEngine, WebView, VBox, BorderPane, ScrollPane, Scene;

var File = require('File');
var Platform = Java.type("javafx.application.Platform");
var Target = require(DECAF + '/builtins/dcon/Target').Target,
    target;

//var dcon = {
//    webEngine : null,
//    setSource : function (source) {
//        Platform.runLater(function() {
//            var uiDcon = dcon.webEngine.executeScript('dcon');
//            uiDcon.call('setSource', JSON.stringify(source));
//        });
//    },
//    setThreads: function(threads) {
//        Platform.runLater(function() {
//            var uiDcon = dcon.webEngine.executeScript('dcon');
//            uiDcon.call('setThreads', JSON.stringify(threads));
//        });
//    }
//};


// Extend the javafx.application.Application class overriding init, start and stop.
com.sun.javafx.application.LauncherImpl.launchApplication((Java.extend(javafx.application.Application, {
    // Overridden javafx.application.Application.init();
    init  : function () {
        // Java FX packages and classes must be defined here because
        // they may not be viable until launch time due to clinit ordering.
        try {
            Group = javafx.scene.Group;
            WebEngine = javafx.scene.web.WebEngine;
            WebView = javafx.scene.web.WebView;
            VBox = javafx.scene.layout.VBox;
            BorderPane = javafx.scene.layout.BorderPane;
            ScrollPane = javafx.scene.control.ScrollPane;
            Scene = javafx.scene.Scene;
        }
        catch (e) {
            console.exception(e)
        }
    },

    // Overridden javafx.application.Application.start(Stage stage);
    start : function (stage) {
        var me = this;

        var scripts = [
                'jquery-2.1.3.min.js',
                'jquery-ui.js',
                'jquery.layout.min.js',
                'jquery.console.js',
                'codemirror-5.1/lib/codemirror.js',
                'codemirror-5.1/addon/selection/active-line.js',
                'codemirror-5.1/mode/javascript/javascript.js',
                'client.js'
            ],
            js = [],
            stylesheets = [
                'codemirror-5.1/lib/codemirror.css',
                'layout-default.min.css',
                'dcon.css'
            ],
            css = [];
        var clientPath = DECAF + '/builtins/dcon/client/';
        decaf.each(scripts, function (filename) {
            console.log(filename);
            js.push(new File(clientPath + filename).readAll());
        });
        decaf.each(stylesheets, function (filename) {
            css.push(new File(clientPath+filename).readAll());
        });
        var content = new File(DECAF + '/builtins/dcon/dcon.html').readAll();
        content = content.replace('</head>', '<style type="text/css">' + css.join('\n') + '\n</style>\n</head>');
        content = content.replace('</body>', '<script type="text/javascript">' + js.join('\n') + '\n</script>\n</body>');
        //console.log(content);
        //});
        //builtin.process.exit(1)
        try {
            // Set up stage global.
            //$STAGE = stage;

            stage.setTitle('DCON Kills Bugs Dead!');
            var root = new BorderPane();
            var browser = new WebView();
            me.webEngine = browser.getEngine();
            var scrollPane = new ScrollPane();
            var scene = new Scene(new Group(), 1280, 1024);

            scrollPane.setFitToWidth(true);
            scrollPane.setFitToHeight(true);
            scrollPane.setContent(browser);
            me.webEngine.setOnAlert(function (arg) {
                var message = JSON.parse(arg.data);
                //java.lang.System.out.println('ALERT');
                console.dir({alert : message});
                //java.lang.System.out.println(message);
                switch (message.command) {
                    case 'ready':
                        Platform.runLater(function () {
                            target = new Target(me);
                        });
                        break;
                    case 'stepover':
                        target.stepOver();
                        break;
                    case 'stepin':
                        target.stepIn();
                        break;
                    case 'stepout':
                        target.stepOut();
                        break;
                    case 'resume':
                        target.resume();
                        break;
                    case 'stop':
                        target.pause();
                        break;
                    case 'log':
                        console.dir({log : message.s});
                        break;
                    case 'dir':
                        console.dir({dir : message.o});
                        break;
                    case 'setBreakpoint':
                        target.setBreakpoint(message.name, message.line);
                        break;
                    case 'clearBreakpoint':
                        target.clearBreakpoint(message.name, message.line);
                        break;
                }
            });
            //webEngine.getLoadWorker().stateProperty().addListener(
            //    function(ov, oldState, newState) {
            //        System.out.println("webEngine result "+ newState.toString());
            //    }
            //);
            //webEngine.load('http://layout.jquery-dev.com/demos/simple.html');
            me.webEngine.loadContent(content);
            //dcon.webEngine = webEngine;

            //root.getChildren().addAll(scrollPane);
            root.setCenter(scrollPane);
            scene.setRoot(root);

            stage.setScene(scene);
            stage.show();

            /*
             // Load user FX scripts.
             for each (var script in $SCRIPTS) {
             load(script);
             }

             // Call the global init function if present.
             if (global.init) {
             init();
             }
             // Call the global start function if present.  Otherwise show the stage.
             if (global.start) {
             start(stage);
             } else {
             stage.show();
             }
             */
        }
        catch (e) {
            console.log('exception')
            console.dir(e);
            console.exception(e)
        }
    },

    // Overridden javafx.application.Application.stop();
    stop  : function () {
        // Call the global stop function if present.
        if (global.stop) {
            stop();
        }
    },

    targetCommand : function (o) {
        var me = this;
        //console.dir({ targetCommand: o })
        Platform.runLater(function () {
            var uiDcon = me.webEngine.executeScript('dcon');
            uiDcon.call('targetCommand', JSON.stringify(o));
        });
    }
    //,
    //update : function (state) {
    //    var me = this;
    //    Platform.runLater(function () {
    //        var uiDcon = me.webEngine.executeScript('dcon');
    //        uiDcon.call('update', JSON.stringify(state));
    //    });
    //},
    //console: function(s) {
    //    var me = this;
    //    Platform.runLater(function() {
    //        var uiDcon = me.webEngine.executeScript('dcon');
    //        uiDcon.call('console', s);
    //    })
    //}

    // No arguments passed to application (handled thru $ARG.)
})).class, new (Java.type("java.lang.String[]"))(0));

