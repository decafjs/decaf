/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 3:35 PM
 */

/*global require, builtin */

/**
 * @memberOf builtin
 * @param scope
 */
builtin.applyExtensions = function (scope) {
//    scope.Object.prototype.extend = scope.Function.prototype.extend = function () {
//        var me = this;
//        decaf.each(arguments, function (o) {
//            for (var key in o) {
//                if (o.hasOwnProperty(key)) {
//                    var g = o.__lookupGetter__(key), s = o.__lookupSetter__(key);
//                    if (g || s) {
//                        if (g) {
//                            me.__defineGetter__(key, g);
//                        }
//                        if (s) {
//                            me.__defineSetter__(key, s);
//                        }
//                    }
//                    else {
//                        me[key] = o[key];
//                    }
//                }
//            }
//        });
//        return this;
//    };

    if (!String.prototype.endsWith) {
        Object.defineProperty(String.prototype, 'endsWith', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: function (searchString, position) {
                position = position || this.length;
                position = position - searchString.length;
                var lastIndex = this.lastIndexOf(searchString);
                return lastIndex !== -1 && lastIndex === position;
            }
        });
    }

//    scope.String.prototype.toJavaByteArray = function (encoding) {
//        return encoding ? new java.lang.String(this).getBytes(encoding) : new java.lang.String(this).getBytes();
//    };

    scope.String.prototype.trimLeft = function () {
        return this.replace(/^\s+/, '');
    };

    scope.String.prototype.trimRight = function () {
        return this.replace(/\s+$/, '');
    };

    decaf.extend(scope.Error.prototype, {
        asText  : function () {
            var e = this;
            var text = '';
            if (e instanceof org.mozilla.javascript.RhinoException) {
                text += e.details() + '\n';
            }
            else {
                text += e.toString() + '\n';
            }
            if (e.extra) {
                text += builtin.print_r(e.extra);
            }
            if (typeof e.getScriptStackTrace === 'function') {
                text += e.getScriptStackTrace() + '\n';
            }
            if (typeof e.getWrappedException === 'function') {
                var ee = e.getWrappedException();
                var sw = new java.io.StringWriter(),
                    pw = new java.io.PrintWriter(sw);
                ee.printStacKTrace(new java.io.PrintWriter(sw));
                text += String(sw.toString()) + '\n';
            }
            if (e.stack) {
                var trace = e.stack;
                decaf.each(trace.split('\n'), function (line) {
                    if (line.length) {
                        var l = line.replace(/^\s+at\s+/, '').replace(/:\d+.*$/, '');
                        if (require.isRequiredFile(l)) {
                            l = line.replace(/^.*:/, '').replace(/\s+.*$/, '');
                            text += line.replace(l, parseInt(l, 10) - 7) + '\n';
                        }
                        else {
                            text += line + '\n';
                        }
                    }
                });
                text = text.replace(/\n$/, '');
            }
            return text;

        },
        dumpText: function () {
            java.lang.System.out.println(this.asText());
        }

    });

    scope.Number.prototype.commaFormat = function () {
        var parts = x.toString().split(".");
        return parts[0].replace(/\B(?=(\d{3})+(?=$))/g, ",") + (parts[1] ? "." + parts[1] : "");
    }
};

builtin.applyExtensions(global);
