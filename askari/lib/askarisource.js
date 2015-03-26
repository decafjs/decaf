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

load("askarilayout.js");

var BREAKPOINT_DIM       = 0.05;
var NashornSourceField   = "source";
var NashornContentField  = "content";

function AskariSource() {
    this.file        = null;
    this.chars       = null;
    this.layout      = null;
    this.breakpoints = [];
    this.tab         = null;
    this.classes     = [];
    this.session     = null;
    this.locations   = [];
}

AskariSource.prototype.initFile = function initFile(file, chars) {
    this.file        = file;
    this.chars       = chars;
    this.layout      = new AskariLayout(file.getName(), chars);

    this.initStops();
}

AskariSource.prototype.initSource = function initSource(session, cls) {
    var sourceName = cls.sourceName();
    var remoteSource = session.getStaticValue(cls, NashornSourceField);
    var content = session.invokeMethod("getString", "()Ljava/lang/String;", remoteSource, []).value();
    this.initFile(new File(sourceName), content);
}

AskariSource.prototype.initStops = function initStops() {
    var SOURCE = this;
    var stops = this.layout.stops;

    for (var i = 0; i < stops.length; i++) {
        var stop = stops[i];
        stop.onMouseClicked = (function setMouseClicked(stop, i) {
            return function onMouseClicked(event) {
                if (stop.opacity == 1.0) {
                    SOURCE.clearBreakpoint(i + 1);
                    stop.opacity = BREAKPOINT_DIM;
                } else {
                    SOURCE.setBreakpoint(i + 1);
                    stop.opacity = 1.0;
                }
             }
        })(stop, i);
    }
}

AskariSource.prototype.getName = function getName() {
    return this.file.getName();
}

AskariSource.prototype.getParent = function getParent() {
    return this.file.getParent();
}

AskariSource.prototype.getPath = function getPath() {
    return this.file.toPath();
}

AskariSource.prototype.clearArrows = function clearArrows() {
    var layout = this.layout;

    if (layout) {
        var arrows = layout.arrows;

        for each (var arrow in arrows) {
            arrow.opacity = 0.0;
        }
    }
}

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
}

AskariSource.prototype.setBreakpoint = function setBreakpoint(line) {
    this.breakpoints[line] = true;

    if (this.session) {
        var location = this.findLocation(line);

        if (location) {
            this.session.setBreakpoint(location);
        }
    }
}

AskariSource.prototype.clearSession = function clearSession() {
    this.session = null;
    this.classes = [];
}

AskariSource.prototype.setSession = function setSession(session) {
    this.session = session;
    this.classes     = [];
    this.locations   = [];
}

AskariSource.prototype.addClass = function addClass(cls) {
    this.classes.push(cls);

    for each (var location in cls.allLineLocations()) {
        var line = location.lineNumber();
        this.locations[line] = location;
    }

    for (var breakpoint in this.breakpoints) {
        this.setBreakpoint(breakpoint);
    }
}

AskariSource.prototype.findLocation = function findLocation(line) {
    for (; line <= this.layout.stops.length; line++) {
        var location = this.locations[line];

        if (location) {
            return location;
        }
    }

    return null;
}
