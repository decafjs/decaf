/**
 * Created by mschwartz on 3/21/15.
 */

var DECAF = java.lang.System.getProperty('decaf');

var Platform = Java.type("javafx.application.Platform");

var JDI = Packages.com.sun.jdi;
var AbsentInformationException = JDI.AbsentInformationException;
var Bootstrap = JDI.Bootstrap;
var Thread = java.lang.Thread;
var CharArray = Java.type("char[]");
var InputStreamReader = Java.type("java.io.InputStreamReader");
var NashornScriptFilter = "jdk.nashorn.internal.scripts.Script*";

var InterruptedException = Java.type("java.lang.InterruptedException");
var VMDisconnectedException = JDI.VMDisconnectedException;
var InternalError = Java.type("java.lang.InternalError");
var InterruptedException = Java.type("java.lang.InterruptedException");

var JDIEvent = JDI.event;
var BreakpointEvent = JDIEvent.BreakpointEvent;
var ClassPrepareEvent = JDIEvent.ClassPrepareEvent;
var ClassUnloadEvent = JDIEvent.ClassUnloadEvent;
var ExceptionEvent = JDIEvent.ExceptionEvent;
var LocatableEvent = JDIEvent.LocatableEvent;
var MethodEntryEvent = JDIEvent.MethodEntryEvent;
var MethodExitEvent = JDIEvent.MethodExitEvent;
var StepEvent = JDIEvent.StepEvent;
var ThreadDeathEvent = JDIEvent.ThreadDeathEvent;
var ThreadStartEvent = JDIEvent.ThreadStartEvent;
var VMDeathEvent = JDIEvent.VMDeathEvent;
var VMDisconnectEvent = JDIEvent.VMDisconnectEvent;
var VMStartEvent = JDIEvent.VMStartEvent;
var WatchpointEvent = JDIEvent.WatchpointEvent;

var JDIRequest = JDI.request;
var EventRequest = JDIRequest.EventRequest;
var StepRequest = JDIRequest.StepRequest;

var NashornObjectBase = "jdk.nashorn.internal.scripts.JO";
var NashornScriptBase = "jdk.nashorn.internal.scripts.JS";
var NashornScriptFilter = "jdk.nashorn.internal.scripts.Script*";
var NashornRunScript = "runScript";

function invokeMethod(methodName, signature, receiver, args) {
    var cls = receiver.referenceType();
    var method = (signature ? cls.methodsByName(methodName, signature) : cls.methodsByName(methodName)).get(0);
    var list = new ArrayList();
    args.forEach(function (arg) list.add(arg));

    try {
        return receiver.invokeMethod(this.thread, method, list, ObjectReference.INVOKE_SINGLE_THREADED);
    } catch (ex) {
        exit(1);
    }
}
function getStaticValue(cls, fieldName) {
    var field = cls.fieldByName(fieldName);

    return cls.getValue(field);
}

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

var BREAKPOINT_DIM = 0.05;
var NashornSourceField = "source";
var NashornContentField = "content";

function AskariSource() {
    this.file = null;
    this.chars = null;
    this.breakpoints = [];
    this.classes = [];
    this.locations = [];
}

AskariSource.prototype.initFile = function initFile(file, chars) {
    this.file = file;
    this.chars = chars;

    //this.initStops();
};

AskariSource.prototype.initSource = function initSource(cls) {
    var sourceName = cls.sourceName(),
        file = new File(sourceName);
    this.sourceName = sourceName;
    this.initFile(file, file.readAll());
};

//AskariSource.prototype.initStops = function initStops() {
//    var SOURCE = this;
//    var stops = this.layout.stops;
//
//    for (var i = 0; i < stops.length; i++) {
//        var stop = stops[i];
//        stop.onMouseClicked = (function setMouseClicked(stop, i) {
//            return function onMouseClicked(event) {
//                if (stop.opacity == 1.0) {
//                    SOURCE.clearBreakpoint(i + 1);
//                    stop.opacity = BREAKPOINT_DIM;
//                } else {
//                    SOURCE.setBreakpoint(i + 1);
//                    stop.opacity = 1.0;
//                }
//            }
//        })(stop, i);
//    }
//};

AskariSource.prototype.getName = function getName() {
    return this.file.getName();
};

AskariSource.prototype.getParent = function getParent() {
    return this.file.getParent();
};

AskariSource.prototype.getPath = function getPath() {
    return this.file.toPath();
};

AskariSource.prototype.clearArrows = function clearArrows() {
    var layout = this.layout;

    if (layout) {
        var arrows = layout.arrows;

        for each (var arrow in arrows) {
            arrow.opacity = 0.0;
        }
    }
};

AskariSource.prototype.setArrow = function setStop(line, isTop) {
    var layout = this.layout;

    if (layout) {
        var arrows = layout.arrows;

        if (line < arrows.length) {
            arrows[line].opacity = isTop ? 1.0 : 0.5;
        }
    }
}

AskariSource.prototype.clearBreakpoint = function clearBreakpoint(line) {
    delete this.breakpoints[line];


    if (this.session) {
        var location = this.findLocation(line);

        if (location) {
            this.session.clearBreakpoint(location);
        }
    }
};

AskariSource.prototype.setBreakpoint = function setBreakpoint(line) {
    this.breakpoints[line] = true;

    if (this.session) {
        var location = this.findLocation(line);

        if (location) {
            this.session.setBreakpoint(location);
        }
    }
};

AskariSource.prototype.clearSession = function clearSession() {
    this.session = null;
    this.classes = [];
};

AskariSource.prototype.setSession = function setSession(session) {
    this.session = session;
    this.classes = [];
    this.locations = [];
};

AskariSource.prototype.addClass = function addClass(cls) {
    this.classes.push(cls);

    for each (var location in cls.allLineLocations()) {
        var line = location.lineNumber();
        this.locations[line] = location;
    }

    for (var breakpoint in this.breakpoints) {
        this.setBreakpoint(breakpoint);
    }
};

AskariSource.prototype.findLocation = function findLocation(line) {
    for (; line <= this.layout.stops.length; line++) {
        var location = this.locations[line];

        if (location) {
            return location;
        }
    }

    return null;
};

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

var bootstrapVM = Bootstrap.virtualMachineManager();
var launchingConnector = bootstrapVM.defaultConnector();
var connectionArguments = launchingConnector.defaultArguments();
var thread = null;

function setArgument(name, value) {
    connectionArguments.get(name).setValue(value);
}

setArgument("suspend", true);
// TODO set classpath
setArgument("options", "-server -XX:+TieredCompilation -Xms2G -Xmx2G");
//setArgument("options", "-server -XX:+TieredCompilation -Xms2G -Xmx2G -cp lib/tools.jar");
setArgument("main", "jdk.nashorn.tools.Shell " + DECAF + '/builtins/all.js' + " " + arguments.shift());

var remoteVM = launchingConnector.launch(connectionArguments);
console.dir({
    launchingConnector  : launchingConnector,
    connectionArguments : connectionArguments,
    remoteVM            : remoteVM
})
var connected = true;
var started = false;
var process = remoteVM.process();

var requestManager = remoteVM.eventRequestManager();

function spawnReader(from) {
    var thread = new Thread(function () {
        console.log('reader alive');
        var buffer = new CharArray(1024);
        var inputStream = new InputStreamReader(from);

        for (var length = 0; (length = inputStream.read(buffer, 0, buffer.length)) !== -1;) {
            var text = new java.lang.String(buffer, 0, length);

            java.lang.System.out.println(text);
        }

        Thread.currentThread().join();
        console.log('spwanReader exiting')
    });

    thread.start();

}

spawnReader(process.getInputStream());
spawnReader(process.getErrorStream());


var classPrepareRequest = requestManager.createClassPrepareRequest();
classPrepareRequest.addClassFilter(NashornScriptFilter);
classPrepareRequest.enabled = true;

var classUnloadRequest = requestManager.createClassUnloadRequest();
classUnloadRequest.addClassFilter(NashornScriptFilter);
classUnloadRequest.enabled = true;

var suspended = false;
function vmInterrupted() {
    suspended = true;
}
function handleExitEvent(event) {
    console.dir({
        exitEvent : event
    });
}

var scriptObjectClass;
var sourceMap = {};

function getClass(className) {
    return remoteVM.classesByName(className).get(0);
}
function getMethod(cls, methodName) {
    return cls.methodsByName(methodName).get(0);
}
function handleClassPrepareEvent(event) {
    if (!scriptObjectClass) {
        scriptObjectClass = getClass("jdk.nashorn.internal.runtime.ScriptObject");
        scriptFunctionClass = getClass("jdk.nashorn.internal.runtime.ScriptFunction");
        //objectBaseClass        = getClass(NashornObjectBase);
        //scriptBaseClass        = getClass(NashornScriptBase);
        nativeObjectClass = getClass("jdk.nashorn.internal.objects.NativeObject");
        undefinedClass = getClass("jdk.nashorn.internal.runtime.Undefined");
        debuggerSupportClass = getClass("jdk.nashorn.internal.runtime.DebuggerSupport");
        DebuggerValueDescClass = getClass("jdk.nashorn.internal.runtime.DebuggerSupport$DebuggerValueDesc");

        descKeyField = DebuggerValueDescClass.fieldByName("key");
        descExpandableField = DebuggerValueDescClass.fieldByName("expandable");
        descValueAsObjectField = DebuggerValueDescClass.fieldByName("valueAsObject");
        descValueAsStringField = DebuggerValueDescClass.fieldByName("valueAsString");

        getGlobalMethod = debuggerSupportClass.methodsByName("getGlobal", "()Ljava/lang/Object;").get(0);
        getEvalMethod = debuggerSupportClass.methodsByName("eval", "(Ljdk/nashorn/internal/runtime/ScriptObject;Ljava/lang/Object;Ljava/lang/String;Z)Ljava/lang/Object;").get(0);
        valueInfoMethod = debuggerSupportClass.methodsByName("valueInfo", "(Ljava/lang/String;Ljava/lang/Object;Z)Ljdk/nashorn/internal/runtime/DebuggerSupport$DebuggerValueDesc;").get(0);
        valueInfosMethod = debuggerSupportClass.methodsByName("valueInfos", "(Ljava/lang/Object;Z)[Ljdk/nashorn/internal/runtime/DebuggerSupport$DebuggerValueDesc;").get(0);

        classClass = getClass("java.lang.Class");
    }

    var cls = event.referenceType();
    var sourceName = cls.sourceName();
    var source = sourceMap[sourceName];

    if (!source) {
        source = new AskariSource();
        sourceMap[sourceName] = source;
        source.initSource(cls);
    }

    source.addClass(cls);

    dcon.setSource({
        chars       : source.chars,
        path        : source.sourceName,
        breakpoints : source.breakpoints
    });

    if (!started) {
        started = true;

        var requestManager = remoteVM.eventRequestManager();
        var runScript = getMethod(cls, NashornRunScript);

        if (runScript) {
            try {
                var firstLocation = runScript.allLineLocations().get(0);
                var firstBreakpoint = requestManager.createBreakpointRequest(firstLocation);
                firstBreakpoint.enabled = true;
            } catch (ex if ex instanceof AbsentInformationException) {
                console.exception(ex)
            }
        }
    }
    return false;
}

function AskariThread(thread, frames) {
    this.thread = thread;
    this.frames = frames;
}

AskariThread.prototype.isTop = function isTop() {
    return this.thread == thread;
};

function isJavaScript(path) {
    return path.endsWith(".js");
}

function getFrames(thread) {
    var frames = [];

    for each (var frame in thread.frames()) {
        var location = frame.location();

        try {
            if (isJavaScript(location.sourceName())) {
                var variables = frame.visibleVariables();
                var values = frame.getValues(variables);
                frames.push({frame : frame, location : location, variables : variables, values : values});
            }
        } catch (ex if ex instanceof AbsentInformationException) {
            // Stale frame
        }
    }

    return frames;
}
function getThreads() {
    var threads = [];

    for each (var thread in remoteVM.allThreads()) {
        var frames = getFrames(thread);

        if (frames.length != 0) {
            threads.push({thread : thread, frames : frames});
        }
    }

    return threads;
}

function handleVmStartEvent(event) {
    return false;
}
function handleBreakpointEvent(event) {
    //dcon.breakpoint();
    console.dir({
        breakpoint : event
    });
    return true;
}
function handleEvent(event) {
    if (event instanceof ExceptionEvent) {
        return exceptionEvent(event);
    } else if (event instanceof BreakpointEvent) {
        return handleBreakpointEvent(event);
    } else if (event instanceof WatchpointEvent) {
        return fieldWatchEvent(event);
    } else if (event instanceof StepEvent) {
        return stepEvent(event);
    } else if (event instanceof MethodEntryEvent) {
        return methodEntryEvent(event);
    } else if (event instanceof MethodExitEvent) {
        return methodExitEvent(event);
    } else if (event instanceof ClassPrepareEvent) {
        return handleClassPrepareEvent(event);
    } else if (event instanceof ClassUnloadEvent) {
        return classUnloadEvent(event);
    } else if (event instanceof ThreadStartEvent) {
        return threadStartEvent(event);
    } else if (event instanceof ThreadDeathEvent) {
        return threadDeathEvent(event);
    } else if (event instanceof VMStartEvent) {
        return handleVmStartEvent(event);
    } else if (event instanceof VMDeathEvent) {
        vmDied = true;
        return vmDeathEvent(event);
    } else if (event instanceof VMDisconnectEvent) {
        connected = false;
        if (!vmDied) {
            vmDisconnectEvent(event);
        }

        return false;
    }

    throw new Error("Unexpected event type: " + event.getClass());
}
function handleDisconnectedException(ex) {
    var queue = remoteVM.eventQueue();

    while (connected) {
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

function spawnEventManager() {
    var thread = new Thread(function () {
        while (connected) {
            var queue = remoteVM.eventQueue();

            try {
                var eventSet = queue.remove();
                var resumeStoppedApp = false;
                var it = eventSet.eventIterator();

                while (it.hasNext()) {
                    var evt = it.nextEvent();
                    resumeStoppedApp |= !handleEvent(evt);
                    console.dir({
                        evt              : evt,
                        resumeStoppedApp : resumeStoppedApp
                    })
                }

                if (resumeStoppedApp) {
                    eventSet.resume();
                }
                else {
                    if (eventSet.suspendPolicy() === EventRequest.SUSPEND_ALL) {
                        vmInterrupted();
                    }

//TODO whatever here
                    var threads = getThreads();
                    console.dir({threads : threads});

                    for each (var thread in threads) {
                        var frames = [];
                        for each(var frame in thread.frames) {
                            var location = frame.location;
                            var sourceName = location.sourceName();
                            var lineNumber = location.lineNumber();
                            var method = location.method();
                            var source = sourceMap[sourceName];

                            if (!source) {
                                source = new SourceFile(sourceName);
                                me.sources[sourceName] = source;
                            }

                            frames.push({
                                location    : location,
                                sourceName  : sourceName,
                                lineNumber  : lineNumber,
                                method      : method,
                                chars       : source.chars,
                                breakpoints : source.breakpoints
                            })
                        }
                        thread.frames = frames;
                    }
                    dcon.setThreads(threads);
                    //Platform.runLater(function() {
                    //    scene.refresh(session);
                    //});
                }
            } catch (ex if ex instanceof InterruptedException) {

            } catch (ex if ex instanceof VMDisconnectedException) {
                handleDisconnectedException(ex);
                break;
            }
        }

        //Platform.runLater(function () {
        //    scene.refresh(session);
        //});

        Thread.currentThread().join();
    });

    thread.start();
}

spawnEventManager();

//while (1) {
//    Thread.sleep(1);
//}