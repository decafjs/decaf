/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/7/13
 * Time: 5:04 PM
 */

/**
 * @class builtin.print_r
 * @singleton
 *
 * This method is inspired by PHP's print_r() function.  It renders any arbitrarily complext JavaScript object as
 * a human readable string.  This method is the core of console.dir() and other similar methods.
 */

/*global toString */
(function () {

    /** @private */
    function isArray(a) {
        return toString.apply(a) === '[object Array]';
    }

    function isObject(o) {
        return !!o && Object.prototype.toString.call(o) === '[object Object]'; //  || typeof o === 'object';
    }

    function isError(e) {
        return !!e && Object.prototype.toString.call(e) === '[object Error]';
    }

    function isDate(d) {
        return toString.apply(d) === '[object Date]';
    }

    function isFunction(f) {
        return toString.apply(f) === '[object Function]';
    }

    function isJava(c) {
        return toString.apply(c).indexOf('[object Java') !== -1;
    }

    function isString(s) {
        return typeof s === 'string';
    }

    function isNumber(n) {
        return typeof n === 'number' && isFinite(n);
    }

    function isBoolean(b) {
        return typeof b === 'boolean';
    }

    /**
     * @static
     * @method print_r
     *
     * This method recursively examines members of the specified object.  It is possible to have an infinite loop if
     * a member of the object contains a reference to the object itself.  For this reason, a maximum recursion depth
     * may be specified.
     *
     * This method knows how to handle instances of Java classes that are members of the object - in most cases.
     *
     * ### Arguments:
     *
     * - {Mixed} o - the object to render
     * - {Number} max - the maximum depth of recursion (optional, defaults to 4)
     * - {char} sep - character to use for indentation (optional, defaults to ' ')
     * - {Number} l - current level of recursion (generally this is only passed by print_r itself as it recurses)
     *
     * ### Returns:
     * - {String} - the formatted dump of the object.
     *
     * @param o
     * @param max
     * @param sep
     * @param l
     * @returns {string}
     */
    function print_r(o, max, sep, l) {
        max = max || 10;
        sep = sep || ' ';
        if (l === undefined) {
            l = 0;
        }
        var indent = '',
            r = [];

        for (var n = 0; n < l; n++) {
            indent += sep;
        }

        if (o === null) {
            return 'null';
        }
        if (o === undefined) {
            return 'undefined';
        }
        if (l > max) {
            return '*** ' + l;
        }
        if (isString(o)) {
            return '(string) ' + (o.length ? o : '(empty)');
        }
        if (typeof o === 'number' && isNaN(o)) {
            return '(NaN)';
        }
        if (isNumber(o)) {
            return '(number) ' + o;
        }
        if (isDate(o)) {
            return '(date) ' + o;
        }
        if (isBoolean(o)) {
            return '(boolean) ' + o;
        }
        if (isJava(o)) {
            r.push('(' + toString.apply(o).replace(/\[object /, '').replace(/\]/, '') + ')');
            for (key in o) {
                var value = o[key];
//                r.push(sep + indent + '[' + key + '] ' + print_r(value, max, sep, l + 1));
                r.push(sep + indent + '[' + key + '] ');
            }
            return r.join('\n');
        }
        if (isFunction(o)) {
            var body = o.toString();
            body = body.replace(/\n/gm, ' ').replace(/\s+/g, ' ');
            if (body.length > 64) {
                body = body.replace(/\{.*\}/igm, '{ ... }');
            }
            r.push(body);
            decaf.each(o, function (value, key) {
                r.push(sep + indent + '[' + key + '] ' + print_r(value, max, sep, l + 1));
            });
            return r.join('\n');
        }
        if (isArray(o)) {
            r.push('(array)');
//            r.push('[');
            decaf.each(o, function (value, index) {
                r.push(sep + indent + '[' + index + '] ' + print_r(value, max, sep, l + 1));
            });
//            r.push(indent + ']');
            return r.join('\n');
        }
        if (isError(o)) {
            r.push('(error)');
//            r.push('{');
            decaf.each(o, function (value, index) {
                r.push(sep + indent + '[' + index + '] ' + print_r(value, max, sep, l + 1));
            });
//            r.push(indent + '}');
            return r.join('\n');
        }
        if (isObject(o)) {
            r.push('(object)');
//            r.push('{');
            decaf.each(o, function (value, index) {
                r.push(sep + indent + '[' + index + '] ' + print_r(value, max, sep, l + 1));
            });
//            r.push(indent + '}');
            return r.join('\n');
        }
        //if (typeof o === 'object') {
            r.push('(jobject)' + o);
            for (var key in o) {
                r.push(sep + indent + '[' + key + ']' + print_r(o[key], max, sep, l + 1));
            }
        return r.join('\n');
        //}
        //print(toString.apply(o));
        //return '-' + (typeof o) + ' ' + o;
    }
    builtin.print_r = print_r;
}());
