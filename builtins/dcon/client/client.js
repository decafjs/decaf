/**
 * Created by mschwartz on 3/25/15.
 */

function commandTarget(o) {
    console.dir({
        what : 'commandTarget',
        o    : o
    });
    if (typeof o === 'string') {
        alert(JSON.stringify({
            command : o
        }));
    }
    else {
        console.dir({
            what : 'commandTarget',
            o    : o
        });
        alert(JSON.stringify(o));
    }
}

if (!window.console) {
    window.console = {
        dir : function (o) {
            commandTarget({
                command : 'dir',
                o       : o
            });
        },
        log : function (s) {
            commandTarget({
                command : 'log',
                s       : s
            });
        }
    }
}
/**
 *    UI Layout Callback: resizePaneAccordions
 *
 *    This callback is used when a layout-pane contains 1 or more accordions
 *    - whether the accordion a child of the pane or is nested within other elements
 *    Assign this callback to the pane.onresize event:
 *
 *    SAMPLE:
 *    < jQuery UI 1.9: $("#elem").tabs({ show: $.layout.callbacks.resizePaneAccordions });
 *    > jQuery UI 1.9: $("#elem").tabs({ activate: $.layout.callbacks.resizePaneAccordions });
 *    $("body").layout({ center__onresize: $.layout.callbacks.resizePaneAccordions });
 *
 *    Version:    1.2 - 2013-01-12
 *    Author:        Kevin Dalman (kevin@jquery-dev.com)
 */
(function ($) {
    var _ = $.layout;

// make sure the callbacks branch exists
    if (!_.callbacks) _.callbacks = {};

    _.callbacks.resizePaneAccordions = function (x, ui) {
        // may be called EITHER from layout-pane.onresize OR tabs.show
        var $P = ui.jquery ? ui : $(ui.newPanel || ui.panel);
        // find all VISIBLE accordions inside this pane and resize them
        $P.find(".ui-accordion:visible").each(function () {
            var $E = $(this);
            if ($E.data("accordion"))		// jQuery < 1.9
                $E.accordion("resize");
            if ($E.data("ui-accordion"))	// jQuery >= 1.9
                $E.accordion("refresh");
        });
    };
})(jQuery);

var terminal,
    editor,
    layout;

$(function () {
    editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers     : true,
        gutters         : ["CodeMirror-linenumbers", "breakpoints"],
        styleActiveLine : true,
        readOnly        : 'nocursor'
    });
    editor.on("gutterClick", function (cm, n) {
        var info = cm.lineInfo(n),
            source = ui.source;
        console.dir({
            info      : info,
            source    : source,
            locations : source.locations
        });
        console.log('a');
        if (source && source.locations && source.locations[info.line + 1]) {
            console.log('b');
            if (info.gutterMarkers) {
                console.log('c');
                console.dir(source);
                commandTarget({
                    command : 'clearBreakpoint',
                    name  : source.name,
                    line    : info.line + 1
                });
                console.log('d');
            }
            else {
                console.log('e');
                console.log(source);
                commandTarget({
                    command: 'setBreakpoint',
                    name: source.name,
                    line: info.line+1
                });
                console.log('f');
            }
            console.log('g');
            cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
            console.log('h');
        }
    });

    function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#822";
        marker.innerHTML = "●";
        return marker;
    }

    layout = $('body').layout({
        south__size          : 300,
        east__onresize       : $.layout.callbacks.resizePaneAccordions,
        north__resizable     : false,
        center__childOptions : {
            north__spacing_open : 0,
            north__resizable    : false,
            south__spacing_open : 0,
            south__resizable    : false
        },
        onresize             : function () {
            if (editor) {
                editor.refresh();
            }
//            layout.resizeAll();
//            alert('onresize')
        }
    });
    var console1 = $('<div class="console">');
    $('#console').append(console1);
    terminal = console1.console({
        promptLabel: 'dcon> ',
        welcomeMessage: 'DCON Kills Bugs Dead!',
        commandHandle: function(line) {
            console.log(line);
            return 'here'
        },
        autofocus: true,
        animateScroll: true,
        promptHistory: true
    });
    setTimeout(function() {
        terminal.report('alive');
    }, 5000)
    // ACCORDION - in the West pane
    $("#accordion1").accordion({
        heightStyle : "fill"
    });

    editor.refresh();

    $('#stack-select').on('select', function () {
        console.log('select');
    }).on('change', function () {
        console.log('change');
    }).on('blur', function () {
        console.log('blur');
    });

    $('#run-button').on('click', function (e) {
        e.stopPropagation();
        if ($(this).html() === 'Run') {
            commandTarget('resume');
            dcon.suspended = false;
            ui.updateButtons();
            ui.console('Resuming execution');
        }
        else {
            commandTarget('stop');
            dcon.suspended = true;
            ui.updateButtons();
        }
    });
    $('#stepover-button').on('click', function (e) {
        e.stopPropagation();
        commandTarget('stepover');
    });
    $('#stepin-button').on('click', function (e) {
        e.stopPropagation();
        commandTarget('stepin');
    });
    $('#stepout-button').on('click', function (e) {
        e.stopPropagation();
        commandTarget('stepout');
    });
});
$(window).resize(function (e) {
//        control('resize ' + $('body').width() + ' x ' + $('body').height());
    layout.resizeAll();
    $('body').layout();
});

var ui = {
    source            : null,
    updateStaackTrace : function () {
        var options = '';

        $.each(dcon.frames, function (ndx, frame) {
            var value = frame.sourceName + ':' + frame.lineNumber;
            options += '<option class="stack-select-option" value="' + value + '">' + value + '</option>';
        });
        $('#stack-select').html(options).prop('disabled', dcon.frames.length === 0);
    },
    updateEditor      : function (sourceName, lineNumber) {
        lineNumber = lineNumber || 1;
        var source = dcon.sources[sourceName];
        this.source = source;
        editor.setValue(source.chars);
        editor.scrollIntoView({line : lineNumber, ch : 1}, 10);
        editor.setCursor({line : lineNumber - 1, ch : 1});
        $('#filename').html(sourceName);
    },
    updateSourceFiles : function () {
        try {
            var options = '';
            $.each(dcon.sources, function (filename, source) {
                options += '<option value="' + filename + '">' + filename + '</option>';
            });
            $('#sources-select').html(options).prop('disabled', dcon.sources.length === 0);
            if (dcon.frames.length) {
                var frame = dcon.frames[0];
                var sourceName = frame.sourceName;
                this.updateEditor(sourceName, frame.lineNumber);
            }
        }
        catch (e) {
            console.dir(e);
        }
    },
    updateBreakpoints : function () {
        try {
            var options = '',
                disabled = false;

            $.each(dcon.breakpoints, function (index, breakpoint) {
                options += '<option value="' + breakpoint + '">' + breakpoint + '</option>';
            });
            if (dcon.breakpoints.length === 0) {
                disabled = true;
                options = '<option>NO BREAKPOINTS SET</option>';
            }
            $('#breakpoints-select').html(options).prop('disabled', disabled);
        }
        catch (e) {
            console.dir(e);
        }
    },
    updateButtons     : function () {
        if (dcon.suspended === true) {
            $('#run-button').text('Run');
            $('stepover-button').prop('disabled', false);
            $('stepin-button').prop('disabled', false);
            $('stepout-button').prop('disabled', false);
        }
        else {
            $('#run-button').text('Stop');
            $('stepover-button').prop('disabled', true);
            $('stepin-button').prop('disabled', true);
            $('stepout-button').prop('disabled', true);
        }
    },
    console           : function (s) {
        terminal.report(s);
        console.dir({
            console: s
        })
        //console.dir(terminal);
//            terminal.output(s);
//            $('#console').append('<pre style="margin: 0; padding: 0">' + s + '</pre>');
    }
};

window.dcon = {
    sources : {},
    frames  : [],

    targetCommand : function (command) {
        var me = this;
        command = JSON.parse(command);
        switch (command.command) {
            case 'console':
                me.console(command.message);
                break;
            case 'update':
                me.update(command.state);
                break;
        }
    },
    console       : function (s) {
        ui.console(s);
    },
    update        : function (state) {
        var me = this;

        console.log('UPDATE');
        console.dir({state : state});

        me.thread = state.thread;
        me.sources = state.sources;
        me.suspended = state.suspended;
        me.threads = state.threads;
        me.breakpoints = state.breakpoints;

        var threads = state.threads,
            newFrames = [];

        $.each(threads, function (index, thread) {
            $.each(thread.frames, function (index, frame) {
                newFrames.push({
                    sourceName : frame.sourceName,
                    lineNumber : frame.lineNumber
                });
            })
        });

        me.frames = newFrames;

        ui.updateStaackTrace();
        ui.updateSourceFiles();
        ui.updateBreakpoints();
        ui.updateButtons();
        if (me.suspended && me.thread) {
            var firstFrame = me.threads[0].frames[0];
            ui.console('Stopped at ' + firstFrame.sourceName + ':' + firstFrame.lineNumber + ' in thread ' + me.thread);
        }
        ui.console('status: ' + state.status);
    }
};

commandTarget('ready');
//    console.log('here')