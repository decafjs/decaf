/**
 * Created by mschwartz on 3/26/15.
 */

(function () {
    function command( o ) {
        alert(JSON.stringify(o));
    }

    window.Target = {
        ready           : function () {
            command({
                command : 'ready'
            });
        },
        evaluate        : function ( s ) {
            command({
                command : 'eval',
                expr    : s
            });
        },
        suspend         : function () {
            command({
                command : 'suspend'
            });
        },
        resume          : function () {
            command({
                command : 'resume'
            });
        },
        stepIn          : function () {
            command({
                command : 'stepIn'
            });
        },
        stepOver        : function () {
            command({
                command : 'stepOver'
            });
        },
        stepOut         : function () {
            command({
                command : 'stepOut'
            });
        },
        setBreakpoint   : function ( filename, lineNumber ) {
            command({
                command    : 'setBreakpoint',
                filename   : filename,
                lineNumber : lineNumber
            });
        },
        clearBreakpoint : function ( filename, lineNumber ) {
            command({
                command    : 'clearBreakpoint',
                filename   : filename,
                lineNumber : lineNumber
            });
        },
        console         : {
            log : function ( s ) {
                command({
                    command : 'console.log',
                    s       : s
                });
            },
            dir : function ( o ) {
                command({
                    command : 'console.dir',
                    o       : o
                });
            }
        }
    };
}());
