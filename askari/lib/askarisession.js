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

var ArrayList                  = Java.type("java.util.ArrayList");
var CharArray                  = Java.type("char[]");
var File                       = Java.type("java.io.File");
var InputStreamReader          = Java.type("java.io.InputStreamReader");
var InternalError              = Java.type("java.lang.InternalError");
var InterruptedException       = Java.type("java.lang.InterruptedException");
var OutputStreamWriter         = Java.type("java.io.OutputStreamWriter");
var Platform                   = Java.type("javafx.application.Platform");
var System                     = Java.type("java.lang.System");
var Thread                     = Java.type("java.lang.Thread");

var JDI                        = Packages.com.sun.jdi;
var AbsentInformationException = JDI.AbsentInformationException;
var Bootstrap                  = JDI.Bootstrap;
var Locatable                  = JDI.Locatable;
var ObjectReference            = JDI.ObjectReference;
var VMDisconnectedException    = JDI.VMDisconnectedException;

var ArrayReference             = JDI.ArrayReference;
var BooleanValue               = JDI.BooleanValue;
var ByteValue                  = JDI.ByteValue;
var CharValue                  = JDI.CharValue;
var ClassLoaderReference       = JDI.ClassLoaderReference;
var ClassObjectReference       = JDI.ClassObjectReference;
var ClassType                  = JDI.ClassType;
var DoubleValue                = JDI.DoubleValue;
var FloatValue                 = JDI.FloatValue;
var IntegerValue               = JDI.IntegerValue;
var LongValue                  = JDI.LongValue;
var ObjectReference            = JDI.ObjectReference;
var PrimitiveValue             = JDI.PrimitiveValue;
var ShortValue                 = JDI.ShortValue;
var StringReference            = JDI.StringReference;
var ThreadGroupReference       = JDI.ThreadGroupReference;
var ThreadReference            = JDI.ThreadReference;
var VoidValue                  = JDI.VoidValue;

var JDIEvent                   = JDI.event;
var BreakpointEvent            = JDIEvent.BreakpointEvent;
var ClassPrepareEvent          = JDIEvent.ClassPrepareEvent;
var ClassUnloadEvent           = JDIEvent.ClassUnloadEvent;
var ExceptionEvent             = JDIEvent.ExceptionEvent;
var LocatableEvent             = JDIEvent.LocatableEvent;
var MethodEntryEvent           = JDIEvent.MethodEntryEvent;
var MethodExitEvent            = JDIEvent.MethodExitEvent;
var StepEvent                  = JDIEvent.StepEvent;
var ThreadDeathEvent           = JDIEvent.ThreadDeathEvent;
var ThreadStartEvent           = JDIEvent.ThreadStartEvent;
var VMDeathEvent               = JDIEvent.VMDeathEvent;
var VMDisconnectEvent          = JDIEvent.VMDisconnectEvent;
var VMStartEvent               = JDIEvent.VMStartEvent;
var WatchpointEvent            = JDIEvent.WatchpointEvent;

var JDIRequest                 = JDI.request;
var EventRequest               = JDIRequest.EventRequest;
var StepRequest                = JDIRequest.StepRequest;

var NashornObjectBase          = "jdk.nashorn.internal.scripts.JO";
var NashornScriptBase          = "jdk.nashorn.internal.scripts.JS";
var NashornScriptFilter        = "jdk.nashorn.internal.scripts.Script*";
var NashornRunScript           = "runScript";

load("askarithread.js");
load("askariframe.js");

function AskariSession(scene, source) {
    this.scene       = scene;
    this.mainSource  = source;
    this.args        = this.getArgs(source);
    this.sourceMap   = {};
    this.connected   = false;
    this.suspended   = false;
    this.started     = false;
    this.vmDied      = false;
    this.thread      = null;

    this.sourceMap[source.getPath()] = source;
}

AskariSession.bootstrapVM = Bootstrap.virtualMachineManager();

AskariSession.prototype.setArgument = function setArgument(name, value) {
    this.connectionArguments.get(name).setValue(value);
}

AskariSession.prototype.getArgs = function getArgs(source) {
    var chars = source.chars;
    var firstLine = chars.substring(0, chars.indexOf('\n'));

    var starts = ["#!/usr/bin/jjs ", "#!/usr/bin/env jjs "];

    for each (var start in starts) {
        if (firstLine.startsWith(start)) {
            return firstLine.substring(start.length);
        }
    }

    return "";
}

AskariSession.prototype.isFX = function isFX() {
    return this.args.indexOf("-fx") != -1;
}

AskariSession.prototype.launch = function launch() {
    var source = this.mainSource;

    this.wd = source.getParent();
    this.launchingConnector = AskariSession.bootstrapVM.defaultConnector();
    this.connectionArguments = this.launchingConnector.defaultArguments();

    this.setArgument("suspend", false);
    this.setArgument("options", "-server -XX:+TieredCompilation -Xms2G -Xmx2G -cp lib/tools.jar");
    this.setArgument("main", "jdk.nashorn.tools.Shell " + this.args + " " + source.getPath());

    System.setProperty("user.dir", this.wd);
    this.remoteVM = this.launchingConnector.launch(this.connectionArguments);
    this.connected = true;
    this.process = this.remoteVM.process();

    this.spawnReader("Askari output", this.process.getInputStream(), this.scene.printOutput);
    this.spawnReader("Askari error", this.process.getErrorStream(), this.scene.printError);

    this.spawnEventManager("Askari session event loop");

    var requestManager = this.remoteVM.eventRequestManager();

    var classPrepareRequest = requestManager.createClassPrepareRequest();
    classPrepareRequest.addClassFilter(NashornScriptFilter);
    classPrepareRequest.enabled = true;

    var classUnloadRequest = requestManager.createClassUnloadRequest();
    classUnloadRequest.addClassFilter(NashornScriptFilter);
    classUnloadRequest.enabled = true;
}

AskariSession.prototype.spawnReader = function spawnReader(name, from, to) {
    var SCENE = this.scene;

    var thread = new Thread(function() {
        var buffer = new CharArray(1024);
        var inputStream = new InputStreamReader(from);

        for (var length = 0; (length = inputStream.read(buffer, 0, buffer.length)) !== -1; ) {
            var text = new java.lang.String(buffer, 0, length);

            (function doInFXLoop(t) {
                Platform.runLater(function() {
                    to.apply(SCENE, [t]);
                });
            })(text);
        }

        Thread.currentThread().join();
    }, name);

    thread.start();

}

AskariSession.isJavaScript = function isJavaScript(path) {
    return path.endsWith(".js");
}

AskariSession.prototype.spawnEventManager = function spawnEventManager(name) {
    var session = this;
    var thread = new Thread(function() {
        while (session.connected) {
            var queue = session.remoteVM.eventQueue();

            try {
                var eventSet = queue.remove();
                var resumeStoppedApp = false;
                var it = eventSet.eventIterator();

                while (it.hasNext()) {
                    resumeStoppedApp |= !session.handleEvent(it.nextEvent());
                }

                if (resumeStoppedApp) {
                    eventSet.resume();
                } else {
                    if (eventSet.suspendPolicy() === EventRequest.SUSPEND_ALL) {
                        session.vmInterrupted();
                    }

                    Platform.runLater(function() {
                        session.scene.refresh(session);
                    });
                }
            } catch (ex if ex instanceof InterruptedException) {
            } catch (ex if ex instanceof VMDisconnectedException) {
                session.handleDisconnectedException();
                break;
            }
        }

        Platform.runLater(function() {
            session.scene.refresh(session);
        });

        Thread.currentThread().join();
    }, name);

    thread.start();
}

AskariSession.prototype.getThreads = function getThreads() {
    var threads = [];

    for each (var thread in this.remoteVM.allThreads()) {
        var frames = this.getFrames(thread);

        if (frames.length != 0) {
            threads.push(new AskariThread(this, thread, frames));
        }
    }

    return threads;
}

AskariSession.prototype.getFrames = function getFrames(thread) {
    var frames = [];

    for each (var frame in thread.frames()) {
        var location = frame.location();

        try {
            if (AskariSession.isJavaScript(location.sourceName())) {
                var variables = frame.visibleVariables();
                var values = frame.getValues(variables);
                frames.push(new AskariFrame(this, frame, location, variables, values));
            }
        } catch (ex if ex instanceof AbsentInformationException) {
            // Stale frame
        }
    }

    return frames;
}

AskariSession.prototype.stepover = function stepover() {
    if (this.thread) {
        var requestManager = this.remoteVM.eventRequestManager();
        var stepRequest = requestManager.createStepRequest(this.thread, StepRequest.STEP_LINE, StepRequest.STEP_OVER);
        stepRequest.addClassFilter(NashornScriptFilter);
        stepRequest.enabled = true;
        this.remoteVM.resume();
    }
}

AskariSession.prototype.stepin = function stepin() {
    if (this.thread) {
        var requestManager = this.remoteVM.eventRequestManager();
        var stepRequest = requestManager.createStepRequest(this.thread, StepRequest.STEP_LINE, StepRequest.STEP_INTO);
        stepRequest.addClassFilter(NashornScriptFilter);
        stepRequest.enabled = true;
        this.remoteVM.resume();
    }
}

AskariSession.prototype.stepout = function stepout() {
    if (this.thread) {
        var requestManager = this.remoteVM.eventRequestManager();
        var stepRequest = requestManager.createStepRequest(this.thread, StepRequest.STEP_LINE, StepRequest.STEP_OUT);
        stepRequest.addClassFilter(NashornScriptFilter);
        stepRequest.enabled = true;
        this.remoteVM.resume();
    }
}

AskariSession.prototype.continu = function continu() {
    if (this.remoteVM) {
        this.remoteVM.resume();
    }
}

AskariSession.prototype.pause = function pause() {
    if (this.remoteVM) {
        this.remoteVM.suspend();
    }
}

AskariSession.prototype.stop = function stop() {
    if (this.remoteVM) {
        this.remoteVM.exit(0);
    }
}

AskariSession.prototype.vmInterrupted = function vmInterrupted() {
    this.suspended = true;
}

AskariSession.prototype.handleEvent = function handleEvent(event) {
    if (event instanceof Locatable) {
        this.thread = event.thread();
    }

    if (event instanceof ExceptionEvent) {
        return this.exceptionEvent(event);
    } else if (event instanceof BreakpointEvent) {
        return this.breakpointEvent(event);
    } else if (event instanceof WatchpointEvent) {
        return this.fieldWatchEvent(event);
    } else if (event instanceof StepEvent) {
        return this.stepEvent(event);
    } else if (event instanceof MethodEntryEvent) {
        return this.methodEntryEvent(event);
    } else if (event instanceof MethodExitEvent) {
        return this.methodExitEvent(event);
    } else if (event instanceof ClassPrepareEvent) {
        return this.classPrepareEvent(event);
    } else if (event instanceof ClassUnloadEvent) {
        return this.classUnloadEvent(event);
    } else if (event instanceof ThreadStartEvent) {
        return this.threadStartEvent(event);
    } else if (event instanceof ThreadDeathEvent) {
        return this.threadDeathEvent(event);
    } else if (event instanceof VMStartEvent) {
        return this.vmStartEvent(event);
    } else if (event instanceof VMDeathEvent) {
        this.vmDied = true;
        return this.vmDeathEvent(event);
    } else if (event instanceof VMDisconnectEvent) {
        this.connected = false;
        if (!this.vmDied) {
            this.vmDisconnectEvent(event);
        }

        return false;
    }

    throw new Error("Unexpected event type: " + event.getClass());
}

AskariSession.prototype.handleDisconnectedException = function handleDisconnectedException() {
    var queue = this.remoteVM.eventQueue();

    while (this.connected) {
        try {
            var eventSet = queue.remove();
            var iter = eventSet.eventIterator();
            while (iter.hasNext()) {
                handleExitEvent(iter.next());
            }
        } catch (ex if ex instanceof InterruptedException) {
        } catch (ex if ex instanceof InternalError) {
        }
    }
}

AskariSession.prototype.getPropertyValue = function getPropertyValue(object, key) {
    return this.invokeMethod("get", "(Ljava/lang/Object;)Ljava/lang/Object;", object, [key]);
}

AskariSession.prototype.getValue = function getValue(object, fieldName) {
    var cls = object.referenceType();
    var field = cls.fieldByName(fieldName);

    return object.getValue(field);
}

AskariSession.prototype.getStaticValue = function getStaticValue(cls, fieldName) {
    var field = cls.fieldByName(fieldName);

    return cls.getValue(field);
}

AskariSession.prototype.instanceOf = function instanceOf(object, cls) {
    var method = this.classClass.concreteMethodByName("isInstance", "(Ljava/lang/Object;)Z");

    var list = new ArrayList();
    list.add(object);

    return cls.classObject().invokeMethod(this.thread, method, list, ObjectReference.INVOKE_SINGLE_THREADED).value();
}

AskariSession.prototype.getGlobal = function getGlobal(thread) {
    return this.debuggerSupportClass.invokeMethod(thread, this.getGlobalMethod, new ArrayList(), ClassType.INVOKE_SINGLE_THREADED);
}

AskariSession.prototype.evaluate = function evaluate(str) {
    var frame = this.thread.frames(0, 1).get(0);
    var scopeVar = frame.visibleVariableByName(":scope");
    var thisVar = frame.visibleVariableByName(":this");
    var scope = scopeVar ? frame.getValue(scopeVar) : null;
    var self = thisVar ? frame.getValue(thisVar) : null;

    var list = new ArrayList();
    list.add(scope);
    list.add(self);
    list.add(this.remoteVM.mirrorOf(str));
    list.add(this.remoteVM.mirrorOf(false));

    var result = this.debuggerSupportClass.invokeMethod(this.thread, this.getEvalMethod, list, ClassType.INVOKE_SINGLE_THREADED);

    if (result instanceof StringReference) {
        return result.value();
    } else {
        return "";
    }
}

AskariSession.prototype.valueInfos = function valueInfos(value, all) {
    var list = new ArrayList();
    list.add(value);
    list.add(this.remoteVM.mirrorOf(all));
    return this.debuggerSupportClass.invokeMethod(this.thread, this.valueInfosMethod, list, ClassType.INVOKE_SINGLE_THREADED).getValues();
}

AskariSession.prototype.valueInfo = function valueInfo(name, value, all) {
    var list = new ArrayList();
    list.add(this.remoteVM.mirrorOf(name));
    list.add(value);
    list.add(this.remoteVM.mirrorOf(all));
    return this.debuggerSupportClass.invokeMethod(this.thread, this.valueInfoMethod, list, ClassType.INVOKE_SINGLE_THREADED);
}

AskariSession.prototype.getKey = function getKey(desc) {
    return desc.getValue(this.descKeyField).value();
}

AskariSession.prototype.getExpandable = function getExpandable(desc) {
    return desc.getValue(this.descExpandableField).value();
}

AskariSession.prototype.getValueAsObject = function getValueAsObject(desc) {
    return desc.getValue(this.descValueAsObjectField);
}

AskariSession.prototype.getValueAsString = function getValueAsString(desc) {
    return desc.getValue(this.descValueAsStringField).value();
}

AskariSession.prototype.getMethod = function getMethod(cls, methodName) {
    return cls.methodsByName(methodName).get(0);
}

AskariSession.prototype.invokeMethod = function invokeMethod(methodName, signature, receiver, args) {
    var cls = receiver.referenceType();
    var method = (signature ? cls.methodsByName(methodName, signature) : cls.methodsByName(methodName)).get(0);
    var list = new ArrayList();
    args.forEach(function(arg) list.add(arg));

    try {
        return receiver.invokeMethod(this.thread, method, list, ObjectReference.INVOKE_SINGLE_THREADED);
    } catch (ex) {
        exit(1);
    }
}

AskariSession.prototype.invokeStaticMethod = function invokeStaticMethod(methodName, signature, cls, args) {
    var method = (signature ? cls.methodsByName(methodName, signature) : cls.methodsByName(methodName)).get(0);
    var list = new ArrayList();
    args.forEach(function(arg) list.add(arg));

    try {
        return cls.invokeMethod(this.thread, method, list, ClassType.INVOKE_SINGLE_THREADED);
    } catch (ex) {
        exit(1);
    }
}

AskariSession.prototype.getClass = function getClass(className) {
    return this.remoteVM.classesByName(className).get(0);
}

AskariSession.prototype.setBreakpoint = function setBreakpoint(location) {
    var requestManager = this.remoteVM.eventRequestManager();

    for each (var breakpoint in requestManager.breakpointRequests()) {
        if (breakpoint.location().compareTo(location) == 0) {
            breakpoint.enabled = true;
            return;
        }
    }

    try {
        var breakpoint = requestManager.createBreakpointRequest(location);
        breakpoint.enabled = true;
    } catch (ex if ex instanceof AbsentInformationException) {
    }
}

AskariSession.prototype.clearBreakpoint = function clearBreakpoint(location) {
    var requestManager = this.remoteVM.eventRequestManager();

    for each (var breakpoint in requestManager.breakpointRequests()) {
        if (breakpoint.location().compareTo(location) == 0) {
            breakpoint.enabled = false;
            return;
        }
    }
}

AskariSession.prototype.vmStartEvent = function vmStartEvent(event) {
    return false;
}

AskariSession.prototype.breakpointEvent = function breakpointEvent(event) {

    return true;
}

AskariSession.prototype.methodEntryEvent = function methodEntryEvent(event) {
    return false;
}

AskariSession.prototype.methodExitEvent = function methodExitEvent(event) {
    return false;
}

AskariSession.prototype.fieldWatchEvent = function fieldWatchEvent(event) {
    return true;
}

AskariSession.prototype.stepEvent = function stepEvent(event) {
    var requestManager = this.remoteVM.eventRequestManager();
    var request = requestManager.stepRequests().get(0);
    requestManager.deleteEventRequest(request);

    return true;
}

AskariSession.prototype.classPrepareEvent = function classPrepareEvent(event) {
    if (!this.scriptObjectClass) {
        this.scriptObjectClass      = this.getClass("jdk.nashorn.internal.runtime.ScriptObject");
        this.scriptFunctionClass    = this.getClass("jdk.nashorn.internal.runtime.ScriptFunction");
        this.objectBaseClass        = this.getClass(NashornObjectBase);
        this.scriptBaseClass        = this.getClass(NashornScriptBase);
        this.nativeObjectClass      = this.getClass("jdk.nashorn.internal.objects.NativeObject");
        this.undefinedClass         = this.getClass("jdk.nashorn.internal.runtime.Undefined");
        this.debuggerSupportClass   = this.getClass("jdk.nashorn.internal.runtime.DebuggerSupport");
        this.DebuggerValueDescClass = this.getClass("jdk.nashorn.internal.runtime.DebuggerSupport$DebuggerValueDesc");

        this.descKeyField           = this.DebuggerValueDescClass.fieldByName("key");
        this.descExpandableField    = this.DebuggerValueDescClass.fieldByName("expandable");
        this.descValueAsObjectField = this.DebuggerValueDescClass.fieldByName("valueAsObject");
        this.descValueAsStringField = this.DebuggerValueDescClass.fieldByName("valueAsString");

        this.getGlobalMethod        = this.debuggerSupportClass.methodsByName("getGlobal", "()Ljava/lang/Object;").get(0);
        this.getEvalMethod          = this.debuggerSupportClass.methodsByName("eval", "(Ljdk/nashorn/internal/runtime/ScriptObject;Ljava/lang/Object;Ljava/lang/String;Z)Ljava/lang/Object;").get(0);
        this.valueInfoMethod        = this.debuggerSupportClass.methodsByName("valueInfo", "(Ljava/lang/String;Ljava/lang/Object;Z)Ljdk/nashorn/internal/runtime/DebuggerSupport$DebuggerValueDesc;").get(0);
        this.valueInfosMethod       = this.debuggerSupportClass.methodsByName("valueInfos", "(Ljava/lang/Object;Z)[Ljdk/nashorn/internal/runtime/DebuggerSupport$DebuggerValueDesc;").get(0);

        this.classClass             = this.getClass("java.lang.Class");
    }

    var cls = event.referenceType();
    var sourceName = cls.sourceName();
    var source = this.sourceMap[sourceName];

    if (!source) {
        source = new AskariSource();
        this.sourceMap[sourceName] = source;
    }

    source.addClass(cls);

    if (!this.started && !sourceName.endsWith("bootstrap.js")) {
        this.started = true;

        var requestManager = this.remoteVM.eventRequestManager();
        var runScript = this.getMethod(cls, NashornRunScript);

        if (runScript) {
            try {
                var firstLocation = runScript.allLineLocations().get(0);
                var firstBreakpoint = requestManager.createBreakpointRequest(firstLocation);
                firstBreakpoint.enabled = true;
            } catch (ex if ex instanceof AbsentInformationException) {
            }
        }
    }

    return false;
}

AskariSession.prototype.classUnloadEvent = function classUnloadEvent(event) {
    return false;
}

AskariSession.prototype.exceptionEvent = function exceptionEvent(event) {
    return true;
}

AskariSession.prototype.threadDeathEvent = function threadDeathEvent(event) {
    return false;
}

AskariSession.prototype.threadStartEvent = function threadStartEvent(event) {
    return false;
}

AskariSession.prototype.vmDeathEvent = function vmDeathEvent(event) {
    return false;
}

AskariSession.prototype.vmDisconnectEvent = function vmDisconnectEvent(event) {
    for each (var source in this.sourceMap) {
        source.clearSession();
    }

    this.removeVM = null;

    return false;
}
