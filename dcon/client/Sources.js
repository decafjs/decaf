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
                lineNumbers     : true,
                gutters         : [ "CodeMirror-linenumbers", "breakpoints" ],
                styleActiveLine : true,
                readOnly        : 'nocursor'
            });
            editor.on("gutterClick", function ( cm, n ) {
                console.dir({
                    gutterClick: cm,
                    n: n,
                    source: Sources.source
                });
                var me,
                    info = cm.lineInfo(n),
                    source = Sources.source;

                console.dir({
                    info      : info,
                    source    : source,
                    locations : source.locations
                });
                if ( source && source.locations && source.locations[ info.line + 1 ] ) {
                    if ( info.gutterMarkers ) {
                        Target.clearBreakpoint(source.name, info.line+1);
                    }
                    else {
                        Target.setBreakpoint(source.name, info.line+1);
                    }
                    cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
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
        load     : function ( source, lineNumber ) {
            var me = this;
            console.dir({
                load       : source,
                lineNumber : lineNumber
            });
            Sources.source = source;
            editor.setValue(source.chars);
            editor.scrollIntoView({ line : lineNumber, ch : 1 }, 10);
            editor.setCursor({ line : lineNumber - 1, ch : 1 });
            $('#filename').html(source.name);
            console.dir(me);
        }
    };
}());
