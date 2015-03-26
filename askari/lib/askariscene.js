var ArrayList          = Java.type("java.util.ArrayList");
var BorderPane         = Java.type("javafx.scene.layout.BorderPane");
var Button             = Java.type("javafx.scene.control.Button");
var Callback           = Java.type("javafx.util.Callback");
var Color              = Java.type("javafx.scene.paint.Color");
var CheckBox           = Java.type("javafx.scene.control.CheckBox");
var Double             = Java.type("java.lang.Double");
var ExtensionFilter    = Java.type("javafx.stage.FileChooser.ExtensionFilter");
var File               = Java.type("java.io.File");
var Files              = Java.type("java.nio.file.Files");
var FileChooserBuilder = Java.type("javafx.stage.FileChooserBuilder");
var Font               = Java.type("javafx.scene.text.Font");
var FontWeight         = Java.type("javafx.scene.text.FontWeight");
var FontPosture        = Java.type("javafx.scene.text.FontPosture");
var FXCollections      = Java.type("javafx.collections.FXCollections");
var FXMLLoader         = Java.type("javafx.fxml.FXMLLoader");
var HashMap            = Java.type("java.util.HashMap");
var Image              = Java.type("javafx.scene.image.Image");
var ImageView          = Java.type("javafx.scene.image.ImageView");
var MapValueFactory    = Java.type("javafx.scene.control.cell.MapValueFactory");
var Menu               = Java.type("javafx.scene.control.Menu");
var MenuBar            = Java.type("javafx.scene.control.MenuBar");
var MenuItem           = Java.type("javafx.scene.control.MenuItem");
var ObservableList     = Java.type("javafx.collections.ObservableList");
var Pos                = Java.type("javafx.geometry.Pos");
var PrintStream        = Java.type("java.io.PrintStream");
var ReadOnlyStringWrapper = Java.type("javafx.beans.property.ReadOnlyStringWrapper");
var Scene              = Java.type("javafx.scene.Scene");
var ScrollPane         = Java.type("javafx.scene.control.ScrollPane");
var Stage              = Java.type("javafx.stage.Stage");
var StandardCharsets   = Java.type("java.nio.charset.StandardCharsets");
var Tab                = Java.type("javafx.scene.control.Tab");
var TableColumn        = Java.type("javafx.scene.control.TableColumn");
var TableView          = Java.type("javafx.scene.control.TableView");
var Text               = Java.type("javafx.scene.text.Text");
var TextArea           = Java.type("javafx.scene.control.TextArea");
var TextField          = Java.type("javafx.scene.control.TextField");
var TextFlow           = Java.type("javafx.scene.text.TextFlow");
var TreeItem           = Java.type("javafx.scene.control.TreeItem");
/*
 * Copyright (c) 2010, 2013, Oracle and/or its affiliates. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   - Neither the name of Oracle nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var TreeTableCell      = Java.type("javafx.scene.control.TreeTableCell");
var TreeTableColumn    = Java.type("javafx.scene.control.TreeTableColumn");
var TreeTableView      = Java.type("javafx.scene.control.TreeTableView");
var TreeView           = Java.type("javafx.scene.control.TreeView");
var VBox               = Java.type("javafx.scene.layout.VBox");

var TreeItemExtend     = Java.extend(TreeItem);
var TreeTableCellExtend = Java.extend(TreeTableCell);

var FONT_FAMILY        = "Courier New";
var FONT_SIZE          = 14;
var FONT_NORMAL        = Font.font(FONT_FAMILY, FONT_SIZE);
var FONT_BOLD          = Font.font(FONT_FAMILY, FontWeight.BOLD, FONT_SIZE);
var FONT_ITALIC        = Font.font(FONT_FAMILY, FontPosture.ITALIC, FONT_SIZE);


load("askarisource.js");
load("askarisession.js");

AskariScene.javaFileChooser = FileChooserBuilder.create().
                      title("Open JavaScript file").
                      extensionFilters(new ExtensionFilter("JavaScript", "*.js")).
                      build();

function AskariScene() {
    function loadView(fxmlPath) {
        var fxmlURL = fileToURL(fxmlPath);
        var fxmlLoader = new FXMLLoader();
        fxmlLoader.setLocation(fxmlURL);

        return fxmlLoader.load();
    }

    this.stage = new Stage();
    this.stage.title = "Untitled";

    this.view = loadView("askari.fxml");
    this.scene = new Scene(this.view, 1600, 1000);
    this.stage = new Stage();
    this.stage.scene = this.scene;

    this.sourceMap = {};
    this.session = null;
}

AskariScene.prototype.printOutput = function printOutput(string) {
    var text = new Text(string);
    text.font = FONT_NORMAL;
    this.$("output").children.add(text);
}

AskariScene.prototype.printError = function printError(string) {
    var text = new Text(string);
    text.font = FONT_NORMAL;
    text.fill = Color.RED;
    this.$("output").children.add(text);
}

AskariScene.prototype.show = function show() {
    this.stage.show();

    var THIS = this;

    this.$("open").onAction = function openFile(event) {
        var file = AskariScene.javaFileChooser.showOpenDialog(THIS.scene.window);

        if (file) {
            var source = THIS.sourceMap[file.toPath()];

            if (source) {
                THIS.selectTab(source.tab);
            } else {
                var bytes = Files.readAllBytes(file.toPath());
                var chars = new java.lang.String(bytes, 0, bytes.length, StandardCharsets.UTF_8);
                var source = new AskariSource();
                source.initFile(file, chars);
                THIS.newTab(source);
            }

            var console = THIS.$("console");

            var textFlow = new TextFlow();
            textFlow.id = "output";

            console.children.add(textFlow);
        }
    }

    this.$("close").onAction = function closeFile(event) {
        var source = THIS.findSelectedSource();

        if (source) {
            THIS.closeTab(source.tab);
            delete THIS.sourceMap[source.getPath()];
        }
    }

    this.$("attach").onAction = function attach(event) {
    }

    this.$("debug").onAction = function debug(event) {
        var source = THIS.findSelectedSource();
        THIS.session = new AskariSession(THIS, source);
        source.setSession(THIS.session);
        THIS.session.launch();

        THIS.$("continue").disable = false;
        THIS.$("pause").disable = false;
        THIS.$("stop").disable = false;
        THIS.$("stepover").disable = false;
        THIS.$("stepin").disable = false;
        THIS.$("stepout").disable = false;
    }

    this.$("continue").onAction = function continu(event) {
        if (THIS.session) THIS.session.continu();
    }

    this.$("pause").onAction = function pause(event) {
        if (THIS.session) THIS.session.pause();
    }

    this.$("stop").onAction = function stop(event) {
        if (THIS.session) THIS.session.stop();
        THIS.session = null;

        THIS.$("continue").disable = true;
        THIS.$("pause").disable = true;
        THIS.$("stop").disable = true;
        THIS.$("stepover").disable = true;
        THIS.$("stepin").disable = true;
        THIS.$("stepout").disable = true;
    }

    this.$("stepover").onAction = function stepover(event) {
        if (THIS.session) THIS.session.stepover();
    }

    this.$("stepin").onAction = function stepin(event) {
        if (THIS.session) THIS.session.stepin();
    }

    this.$("stepout").onAction = function stepout(event) {
        if (THIS.session) THIS.session.stepout();
    }

    this.$("input").onAction = function input(event) {
        if (THIS.session) {
            var text = THIS.$("inputtext").text;
            var stream = new PrintStream(THIS.session.process.getOutputStream());
            stream.print(text);
            stream.flush();
            stream.close();
        }
    }

    this.$("evaluate").onAction = function evaluate(event) {
        if (THIS.session) {
            var text = THIS.$("inputtext").text;
            THIS.session.evaluate(text);
            THIS.refresh(THIS.session);
        }
    }
}

AskariScene.prototype.$ = function $(id) {
    return this.view.lookup("#" + id);
}

AskariScene.prototype.newTab = function newTab(source) {
    var editors = this.$("editors");
    var tab = new Tab(source.getName());

    var layout = source.layout;
    tab.content = new ScrollPane(layout.textFlow);
    tab.closable = true;

    source.tab = tab;

    editors.tabs.add(tab);
    editors.selectionModel.select(tab);
    this.sourceMap[source.getPath()] = source;

    this.$("close").disable = false;
    this.$("debug").disable = false;
}

AskariScene.prototype.selectTab = function selectTab(tab) {
    var editors = this.$("editors");
    editors.selectionModel.select(tab);
}

AskariScene.prototype.selectedTab = function selectedTab() {
    var editors = this.$("editors");

    return editors.selectionModel.getSelectedItem();
}

AskariScene.prototype.findSelectedSource = function findSelectedSource() {
    var tab = this.selectedTab();

    if (tab) {
        for each (var source in this.sourceMap) {
            if (source.tab === tab) {
                return source;
            }
        }
    }

    return null;
}

AskariScene.prototype.getOutput = function getInput() {
    return this.$("input");
}

AskariScene.prototype.getOutput = function getOutput() {
    return this.$("output");
}

AskariScene.prototype.getErrors = function getErrors() {
    return this.$("errors");
}

AskariScene.prototype.closeTab = function closeTab(tab) {
    var editors = this.$("editors");
    editors.tabs.remove(tab);
}

AskariScene.prototype.refresh = function refresh(session) {
    var stacks = this.$("stacks");
    stacks.children.clear();

    for each (var source in session.sourceMap) {
        source.clearArrows();
    }

    if (session.connected) {
        var threads = session.getThreads();

        for each (var thread in threads) {
            var isTop = true;

            for each(var frame in thread.frames) {
                var location = frame.location;
                var sourceName = location.sourceName();
                var lineNumber = location.lineNumber();
                var method = location.method();
                var source = session.sourceMap[sourceName];

                if (source) {
                    if (!source.file) {
                        var cls = source.classes[0];
                        source.initSource(session, cls);

                        if (isTop) {
                            this.newTab(source);
                        }
                    }

                    source.setArrow(lineNumber - 1, isTop);
                }

                isTop = false;
            }
        }
    } else {
        this.$("continue").disable = true;
        this.$("pause").disable = true;
        this.$("stop").disable = true;
        this.$("stepover").disable = true;
        this.$("stepin").disable = true;
        this.$("stepout").disable = true;
    }

    function createDescNode(desc) {
        var node = new TreeItemExtend({
                desc: desc,
                property: session.getKey(desc),
                value: session.getValueAsString(desc),
                expandable: session.getExpandable(desc),
                isFirstTimeChild: true,

                getProperty: function getProperty() {
                    return this.property;
                },

                getValue: function getValue() {
                    return this.value;
                }
            }) {
                getChildren: function getChildren() {
                    var data = node.value;
                    var list = node.super$getChildren();

                    if (data.isFirstTimeChild && session.connected) {
                        data.isFirstTimeChild = false;

                        if (data.expandable) {
                            var value = session.getValueAsObject(data.desc);
                            var descs = session.valueInfos(value, false);

                            for each (var desc in descs) {
                                list.add(createDescNode(desc));
                            }
                        }
                    }

                    return list;
                },

                isLeaf: function isLeaf() {
                    var data = node.value;
                    return !data.expandable;
                }
        }

        return node;
    }

    function createFrameNode(frame) {
        var node = new TreeItemExtend({
                frame: frame,
                property: frame.location.method().name(),
                value: frame.location.toString(),
                isFirstTimeChild: true,

                getProperty: function getProperty() {
                    return this.property;
                },

                getValue: function getValue() {
                    return this.value;
                }
            }) {
                getChildren: function getChildren() {
                    var data = node.value;
                    var list = node.super$getChildren();

                    if (data.isFirstTimeChild && session.connected) {
                        data.isFirstTimeChild = false;

                        var frame = data.frame;
                        var self = frame.findValue(":this");

                        if (self) {
                            list.add(createDescNode(session.valueInfo("this", self, false)));
                        }

                        var scope = frame.findValue(":scope");
                        if (scope) {
                            var descs = session.valueInfos(scope, false);

                            for each (var desc in descs) {
                                list.add(createDescNode(desc));
                            }
                        } else {
                            for each (var variable in frame.variables) {
                                var name = variable.name();
                                if (!name.startsWith(":")) {
                                    var value = frame.values.get(variable);
                                    list.add(createDescNode(session.valueInfo(name, value, false)));
                                }
                            }
                        }
                    }

                    return list;
                },

                isLeaf: function isLeaf() {
                    return false;
                }
        }

        return node;
    }

    function createThreadNode(thread) {
        var node = new TreeItemExtend({
                thread: thread,
                property: "Thread: " + thread.thread.name(),
                isFirstTimeChild: true,

                getProperty: function getProperty() {
                    return this.property;
                },

                getValue: function getValue() {
                    return "";
                }
            }) {
                getChildren: function getChildren() {
                    var data = node.value;
                    var list = node.super$getChildren();

                    if (data.isFirstTimeChild && session.connected) {
                        data.isFirstTimeChild = false;

                        var global = session.getGlobal(data.thread.thread);
                        list.add(createDescNode(session.valueInfo("global", global, false)));
                        var isFirstFrame = true;

                        for each(var frame in data.thread.frames) {
                            var frameNode = createFrameNode(frame);
                            frameNode.expanded = isFirstFrame;
                            isFirstFrame = false;
                            list.add(frameNode);
                        }
                    }

                    return list;
                },

                isLeaf: function isLeaf() {
                    return false;
                }
        };

        return node;
    }

    if (session.connected) {
        var threads = session.getThreads();

        for each (var thread in threads) {
            var firstColumn = new TreeTableColumn("Property");
            firstColumn.setCellValueFactory(function firstColumn(data) {
                var wrapper = new ReadOnlyStringWrapper(data.value.value.getProperty());
                return wrapper;
            });
            /*
            firstColumn.setCellFactory(function firstFactory(column) {
                var cell = new TreeTableCellExtend() {
                    updateItem: function updateItem(value, isEmpty) {
                       cell.text = isEmpty ? "" : value;
                       cell.alignment = Pos.TOP_LEFT;
                    }
                }

                return cell;
            });
            */
            firstColumn.prefWidth = 200.0;

            var secondColumn = new TreeTableColumn("Value");
            secondColumn.minWidth = 600.0;
            secondColumn.setCellValueFactory(function secondColumn(data) {
                var wrapper = new ReadOnlyStringWrapper(data.value.value.getValue());
                return wrapper;
            });
            secondColumn.prefWidth = 600.0;

            var threadNode = createThreadNode(thread);
            threadNode.expanded = true;

            var table = new TreeTableView(threadNode);
            table.columns.setAll(firstColumn, secondColumn);

            stacks.children.add(table);
        }

    }
}

