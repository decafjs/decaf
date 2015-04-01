/**
 * Created by mschwartz on 3/25/15.
 */

if (!window.console) {
    window.console = {
        dir : function (o) {
            console.dir({
                'console.dir' : o
            });
            Target.console.dir(o);
        },
        log : function (s) {
            Target.console.log(s);
        }
    }
}
var terminal;

$(function () {
    console.log('documentReady')
    Sources.init();
    Layout.init();

    var console1 = $('<div class="console">');
    $('#console').append(console1);
    terminal = console1.console({
        promptLabel    : 'dcon> ',
        welcomeMessage : 'DCON Kills Bugs Dead!',
        commandHandle  : function (line) {
            console.dir({
                handle : line
            })
            Target.evaluate(line);
            return true
        },
        autofocus      : true,
        animateScroll  : true,
        promptHistory  : true
    });
    //setTimeout(function () {
    //    terminal.report('alive');
    //}, 5000)
    // ACCORDION - in the West pane
    //$("#accordion1").accordion({
    //    heightStyle : "fill"
    //});

    Sources.refresh();

    //$('#stack-select').selectbox({ customList: true});
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
            Target.resume();
            dcon.suspended = false;
            ui.updateButtons();
            ui.console('Resuming execution');
        }
        else {
            Target.suspend();
            dcon.suspended = true;
            ui.updateButtons();
        }
    });
    $('#stepover-button').on('click', function (e) {
        e.stopPropagation();
        Target.stepOver();
    });
    $('#stepin-button').on('click', function (e) {
        e.stopPropagation();
        Target.stepIn();
    });
    $('#stepout-button').on('click', function (e) {
        e.stopPropagation();
        Target.stepOut();
    });

    $('#select-sources-button').on('click', function (e) {
        e.stopPropagation();
        ui.updateEditor($('#sources-select').val(), 1);
    });
    //Target.ready();
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
        try {
            Sources.load(source, lineNumber);
        }
        catch (e) {
            console.dir(e)
        }
    },
    updateSourceFiles : function () {
        console.log('updateSourceFiles')
        try {
            var options = '';
            console.dir(dcon.sources);
            var sources = [];
            $.each(dcon.sources, function (filename, source) {
                console.dir({ filename: filename });
                sources.push(filename);
            });
            sources.sort();
            //sources.sort(function(a, b) {
            //    return a.filename.localeCompare(b.filename);
            //});
            $.each(sources, function (index, filename) {
                if (filename !== 'nashorn:mozilla_compat.js' && filename !== '<function>') {
                    options += '<option value="' + filename + '">' + filename + '</option>';
                }
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
                disabled = true;

            $.each(dcon.sources, function(index, source) {
                $.each(source.breakpoints, function(line, state) {
                    if (state === 'set') {
                        options += '<option value="' + source.name + ':' + line + '">' + source.name + ':' + line + '</option>';
                        disabled = false;
                    }
                })
            });
            //$.each(dcon.breakpoints, function (index, breakpoint) {
            //    options += '<option value="' + breakpoint + '">' + breakpoint + '</option>';
            //});
            if (disabled) {
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
            $('#stepover-button').prop('disabled', false);
            $('#stepin-button').prop('disabled', false);
            $('#stepout-button').prop('disabled', false);
            $('#stack-select').prop('disabled', false);
            $('#select-stack-button').prop('disabled', false);
            $('#sources-select').prop('disabled', false);
            $('#select-sources-button').prop('disabled', false);
            $('#breakpoints-select').prop('disabled', false);
            $('#select-breakpoints-button').prop('disabled', false);
        }
        else {
            $('#run-button').text('Stop');
            $('#stepover-button').prop('disabled', true);
            $('#stepin-button').prop('disabled', true);
            $('#stepout-button').prop('disabled', true);
            $('#stack-select').prop('disabled', true);
            $('#select-stack-button').prop('disabled', true);
            $('#sources-select').prop('disabled', true);
            $('#select-sources-button').prop('disabled', true);
            $('#breakpoints-select').prop('disabled', true);
            $('#select-breakpoints-button').prop('disabled', true);
        }
    },
    updateConsole     : function () {
        $('#console').prop('disabled', !dcon.suspended);
    },
    console           : function (s) {
        terminal.report(s);
        console.dir({
            console : s
        });
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
        try {
            command = JSON.parse(command);
            switch (command.command) {
                case 'console':
                    me.console(command.message);
                    break;
                case 'update':
                    me.update(command.state);
                    break;
                default:
                    console.dir({
                        invalidTargetCommand : command
                    });
                    break;
            }
        }
        catch (e) {
            console.log(e.stack);
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
            thread = threads[me.thread],
            newFrames = [];

        console.dir({ thread: thread })
        $.each(thread.frames, function (index, frame) {
            newFrames.push({
                sourceName : frame.sourceName,
                lineNumber : frame.lineNumber
            });
        });

        me.frames = newFrames;
        console.dir({ newFrames: newFrames })

        ui.updateStaackTrace();
        ui.updateSourceFiles();
        ui.updateBreakpoints();
        ui.updateButtons();
        ui.updateConsole();

        if (me.suspended && me.thread) {
            var firstFrame = me.threads[me.thread].frames[0];
            ui.console('Stopped at ' + firstFrame.sourceName + ':' + firstFrame.lineNumber + ' in thread ' + me.thread);
        }
        ui.console('status: ' + state.status);
    }
};

//console.log('here')
Target.ready();
