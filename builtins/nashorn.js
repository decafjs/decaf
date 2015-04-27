/*
 * Created by mschwartz on 4/25/14.
 */

/** @ignore */
builtin.rhino = {
    /** @ignore */
    runScript: function(src, filename, lineNumber, scope) {
        filename = filename || 'unknown';
        lineNumber = lineNumber || 1;
        scope = scope || global;
        var ret = load({
            script: src, name: filename
        });
        // evaluateString(scope, src, filename, lineNumber, null);
        return ret;
    }
};

