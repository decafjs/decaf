/**
 * Created by mschwartz on 3/26/15.
 */

(function () {
    function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#822";
        marker.innerHTML = "●";
        return marker;
    }

    var editor;

    window.Sources = {
        editor   : null,
        disabled : false,
        source   : null,
        init     : function () {
            var me = this;

            editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
                mode            : 'javascript',
                lineNumbers     : true,
                gutters         : ["CodeMirror-linenumbers", "breakpoints"],
                styleActiveLine : true,
                readOnly        : 'nocursor',
                theme           : 'solarized light'
            });
            editor.on("gutterClick", function (cm, n) {
                console.dir({
                    gutterClick : cm,
                    n           : n,
                    source      : Sources.source
                });
                var info = cm.lineInfo(n),
                    line = info.line+ 1,
                    source = Sources.source;

                console.dir({
                    info      : info,
                    source    : source,
                    locations : source.locations
                });
                if (source && source.locations && source.locations[line]) {
                    if (source.breakpoints[line]) {

                    //if (info.gutterMarkers) {
                        delete source.breakpoints[line];
                        Target.clearBreakpoint(source.name, line);
                    }
                    else {
                        source.breakpoints[line] = 'set';
                        Target.setBreakpoint(source.name, line);
                    }
                    cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
                    ui.updateBreakpoints();
                }
            });
        },
        refresh  : function () {
            editor.refresh();
        },
        disable  : function () {
            this.diabled = true;
        },
        enable   : function () {
            this.disabled = false;
        },
        load     : function (source, lineNumber) {
            if (Sources.source !== source) {
                Sources.source = source;
                editor.setValue(source.chars);
                $('#filename').html(source.name);
            }
            console.dir(source.breakpoints);
            $.each(source.breakpoints, function(line, state) {
                console.dir({ line: line, state: state });
                if (state === 'set') {
                    var info = editor.lineInfo(line-1);
                    console.dir({ info: info })
                    editor.setGutterMarker(line-1, "breakpoints", info.gutterMarkers ? null : makeMarker());
                }
            });
            editor.scrollIntoView({line : lineNumber, ch : 1}, 100);
            editor.setCursor({line : lineNumber - 1, ch : 1});
        }
    };
}());
