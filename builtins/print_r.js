/** @module builtin */
/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/7/13
 * Time: 5:04 PM
 */

(function() {

    function isArray(a) {
        return toString.apply(a) === '[object Array]';
    }

    function isObject(o) {
        return !!o && Object.prototype.toString.call(o) === '[object Object]';
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
     * @memberOf builtin
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
        if (isNaN(o) && typeof o === 'number') {
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
            r.push('(' + toString.apply(o).replace(/\[object /, '').replace(/\]/, '') +')');
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
            decaf.each(o, function(value, key) {
                r.push(sep + indent + '[' + key + '] ' + print_r(value, max, sep, l + 1));
            });
            return r.join('\n');
        }
        if (isArray(o)) {
            r.push('(array)');
//            r.push('[');
            decaf.each(o, function(value, index) {
                r.push(sep + indent + '[' + index + '] ' + print_r(value, max, sep, l + 1));
            });
//            r.push(indent + ']');
            return r.join('\n');
        }
        if (isError(o)) {
            r.push('(error)');
//            r.push('{');
            decaf.each(o, function(value, index) {
                r.push(sep + indent + '[' + index + '] ' + print_r(value, max, sep, l + 1));
            });
//            r.push(indent + '}');
            return r.join('\n');
        }
        if (isObject(o)) {
            r.push('(object)');
//            r.push('{');
            decaf.each(o, function(value, index) {
                r.push(sep + indent + '[' + index + '] ' + print_r(value, max, sep, l + 1));
            });
//            r.push(indent + '}');
            return r.join('\n');
        }
        print(toString.apply(o))
        return '-' + (typeof o) + ' ' + o;
    }

    builtin.print_r = print_r;
}());

if (false) {
    /**
     * Concatenates the values of a variable into an easily readable string
     * by Matt Hackett [scriptnode.com]
     * @param {Object} x The variable to debug
     * @param {Number} max The maximum number of recursions allowed (keep low, around 5 for HTML elements to prevent errors) [default: 10]
     * @param {String} sep The separator to use between [default: a single space ' ']
     * @param {Number} l The current level deep (amount of recursion). Do not use this parameter: it's for the function's own use
     */
    builtin.print_r = function(x, max, sep, l) {

        l = l || 0;
        max = max || 10;
        sep = sep || ' ';

        if (l > max) {
            return "[WARNING: Too much recursion]\n";
        }

        var
            i,
            r = '',
            t = typeof x,
            tab = '';

        if (x === null) {
            r += "(null)\n";
        } else if (t == 'object') {

            l++;

            for (i = 0; i < l; i++) {
                tab += sep;
            }

            if (x && x.length) {
                t = 'array';
            }

            r += '(' + t + ") :\n";

            for (i in x) {
                console.log(i + ' => ' + x);

                if (typeof x[i] == 'function' && i in Object.prototype) {
                    continue;
                }
                try {
                    r += tab + '[' + i + '] : ' + builtin.print_r(x[i], max, sep, (l + 1));
                }
                catch (e) {
                    return "[ERROR: " + e + "]\n";
                }
            }

        } else {
            if (t == 'string') {
                if (x == '') {
                    x = '(empty)';
                }
            }

            if (t == 'function') {
                if (x.toString().length > 64) {
                    r += 'function() { ... }';
                }
                else {
                    r += x.toString();
                }
            }
            else {
                r += '(' + t + ') ';
                r += x;
            }
            r += "\n";
        }

        return r;

    }


}