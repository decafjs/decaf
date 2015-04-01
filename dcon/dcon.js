/**
 * Created by mschwartz on 3/19/15.
 */

/*global javafx, require */
// this is for nashorn only!

// Check for fx presence.
if ( typeof javafx.application.Application != "function" ) {
    print("JavaFX is not available.");
    exit(1);
}

$SCRIPTS = [];

var DECAF = java.lang.System.getProperty('decaf');

var Group, WebEngine, WebView, VBox, BorderPane, ScrollPane, Scene;

var File = require('File');
var Platform = Java.type("javafx.application.Platform");
var Target = require(DECAF + '/dcon/Target').Target,
    target;

// Client scripts and stylesheets - these run in the WebView
var scripts     = [
        'lib/jquery-2.1.3.min.js',
        //'lib/jquery-ui.js',
        'lib/jquery.layout.min.js',
        'lib/jquery.console.js',
        'lib/codemirror-5.1/lib/codemirror.js',
        'lib/codemirror-5.1/addon/selection/active-line.js',
        'lib/codemirror-5.1/mode/javascript/javascript.js',
        'Target.js',
        'Sources.js',
        'Layout.js',
        'client.js'
    ],
    stylesheets = [
        'lib/codemirror-5.1/lib/codemirror.css',
        'lib/codemirror-5.1/theme/solarized.css',
        //'lib/jquery-ui.css',
        'lib/layout-default.min.css',
        'dcon.css'
    ];


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
            catch ( e ) {
                console.exception(e)
            }
        },

        // Overridden javafx.application.Application.start(Stage stage);
        start : function ( stage ) {
            try {
                var me = this,
                    clientPath = DECAF + '/dcon/client/',
                    js = [],
                    css = [];

                decaf.each(scripts, function ( filename ) {
                    try {
                        js.push('<!-- ' + clientPath + filename +' -->\n<script type="text/javascript">\n' + new File(clientPath + filename).readAll() + '</script>\n');
                    }
                    catch ( e ) {
                        console.dir(e);
                    }
                });
                decaf.each(stylesheets, function ( filename ) {
                    css.push('<!-- ' + clientPath + filename + '-->\n<style type="text/css">\n' + new File(clientPath + filename).readAll() + '</style>\n');
                    //css.push(new File(clientPath + filename).readAll());
                });
                var content = new File(DECAF + '/dcon/client/dcon.html').readAll();
                content = content.split('==scripts==');
                content = content[0] + js.join('\n') + content[1];
                content = content.split('==styles==');
                content = content[0] + css.join('\n') + content[1];
                new File('/tmp/x.html').writeFile(content);

                stage.setTitle('DCON Kills Bugs Dead!');
                var root = new BorderPane();
                var browser = new WebView();
                me.webEngine = browser.getEngine();
                var scrollPane = new ScrollPane();
                var scene = new Scene(new Group(), 1280, 1024);

                scrollPane.setFitToWidth(true);
                scrollPane.setFitToHeight(true);
                scrollPane.setContent(browser);
                me.webEngine.setOnAlert(function ( arg ) {
                    try {
                        var message = JSON.parse(arg.data);
                        //java.lang.System.out.println('ALERT');
                        console.dir({ alert : message });
                        //java.lang.System.out.println(message);
                        switch ( message.command ) {
                            case 'ready':
                                Platform.runLater(function () {
                                    target = new Target(me);
                                });
                                break;
                            case 'stepOver':
                                target.stepOver();
                                break;
                            case 'stepIn':
                                target.stepIn();
                                break;
                            case 'stepOut':
                                target.stepOut();
                                break;
                            case 'resume':
                                target.resume();
                                break;
                            case 'suspend':
                                target.pause();
                                try {
                                    target.stepIn();
                                }
                                catch ( e ) {
                                }
                                break;
                            case 'console.log':
                                console.dir({ log : message.s });
                                break;
                            case 'console.dir':
                                console.dir({ dir : message.o });
                                break;
                            case 'setBreakpoint':
                                target.setBreakpoint(message.filename, message.lineNumber);
                                break;
                            case 'clearBreakpoint':
                                target.clearBreakpoint(message.filename, message.lineNumber);
                                break;
                            case 'eval':
                                console.log('eval')
                                target.evaluate(message.expr);
                                break;
                        }
                    }
                    catch ( e ) {
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
            catch ( e ) {
                console.log('exception')
                console.dir(e);
                console.exception(e)
            }
        },

// Overridden javafx.application.Application.stop();
        stop  : function () {
            // Call the global stop function if present.
            if ( global.stop ) {
                stop();
            }
        }
        ,

        targetCommand : function ( o ) {
            var me = this;
            //console.dir({ targetCommand : o })
            Platform.runLater(function () {
                var uiDcon = me.webEngine.executeScript('dcon');
                uiDcon.call('targetCommand', JSON.stringify(o));
            });
        }
    })).
        class, new (Java.type("java.lang.String[]"))(0)
)
;

