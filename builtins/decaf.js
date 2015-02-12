/**
 * Created by mschwartz on 12/2/13.
 */

var decaf = {

    each: function (o, fn) {
        for (var key in o) {
            if (o.hasOwnProperty && o.hasOwnProperty(key)) {
                if (fn.call(o, o[key], key, o) === false) {
                    return;
                }
            }
        }
    },

    extend: function(me) {
        var args = Array.prototype.slice.call(arguments, 1);
        decaf.each(args, function (o) {
            for (var key in o) {
                if (o.hasOwnProperty(key)) {
                    var desc = Object.getOwnPropertyDescriptor(o, key),
                        g = desc.get, s = desc.set;
                    if (g || s) {
                        Object.defineProperty(me, key, { get: g, set: s, enumerable: true });
                    }
                    else {
                        me[key] = o[key];
                    }
                }
            }
        });
        return me;
    },

    toJavaByteArray: function(thing, encoding) {
        if (typeof thing === 'string') {
            return encoding ? new java.lang.String(thing).getBytes(encoding) : new java.lang.String(thing).getBytes();
        }
        else {
            var len = thing.length;

            var v = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, len);
            try {
                for (var i = 0; i < len; i++) {
                    v[i] = thing[i];
                }
            }
            catch (e) {
                throw new Error('Array.toJavaByteArray - array contains invalid values');
            }
            return v;
        }
    },

    /**
     * <p>
     * Returns true if the passed value is empty.
     * </p>
     * <p>
     * The value is deemed to be empty if it is<div class="mdetail-params">
     * <ul>
     * <li>null</li>
     * <li>undefined</li>
     * <li>an empty array</li>
     * <li>a zero length string (Unless the <tt>allowBlank</tt> parameter
     * is <tt>true</tt>)</li>
     * </ul>
     * </div>
     *
     * @param {Mixed} value The value to test
     * @param {Boolean} allowBlank (optional) true to allow empty strings (defaults to false)
     * @return {Boolean} true if value is empty
     */
    isEmpty: function(v, allowBlank) {
        return v === null || v === undefined || ((Util.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    },

    /**
     * Returns true if the passed value is a JavaScript array, otherwise
     * false.
     *
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isArray: function(v) {
        return toString.apply(v) === '[object Array]';
    },

    /**
     * Returns true if the passed object is a JavaScript date object,
     * otherwise false.
     *
     * @param {Object} object The object to test
     * @return {Boolean}
     */
    isDate: function(v) {
        return toString.apply(v) === '[object Date]';
    },

    /**
     * Returns true if the passed value is a JavaScript Object, otherwise
     * false.
     *
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isObject: function(v) {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },

    /**
     * Returns true if the passed value is a JavaScript 'primitive', a
     * string, number or boolean.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isPrimitive: function(v) {
        return Util.isString(v) || Util.isNumber(v) || Util.isBoolean(v);
    },

    /**
     * Returns true if the passed value is a JavaScript Function, otherwise
     * false.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isFunction: function(v) {
        return toString.apply(v) === '[object Function]';
    },

    /**
     * Returns true if the passed value is a number. Returns false for
     * non-finite numbers.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isNumber: function(v) {
        return typeof v === 'number' && isFinite(v);
    },

    /**
     * Returns true if the passed value is a string.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isString: function(v) {
        return typeof v === 'string';
    },

    /**
     * Returns true if the passed value is a boolean.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isBoolean: function(v) {
        return typeof v === 'boolean';
    },

    /**
     * Returns true if the passed value is not undefined.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isDefined: function(v) {
        return typeof v !== 'undefined';
    },

    /**
     * observable mixin
     */
    observable: {
        on: function(name, handler) {
            var me = this;

            if (!me.__eventHandlers__) {
                me.__eventHandlers__ = [];
            }
            if (!me.__eventHandlers__[name]) {
                me.__eventHandlers__[name] = [];
            }
            me.__eventHandlers__[name].push(handler);
        },
        fire        : function(event) {
            var me = this;
            if (me.__eventHandlers__[event]) {
                var args = Array.prototype.splice.call(arguments, 1);
                decaf.each(me.__eventHandlers__[event] || [], function(fn) {
                    fn.apply(me, args);
                });
            }
        },
        un: function(name, handler) {
            var me = this,
                newHandlers = [];
            if (!me.__eventHandlers__) {
                me.__eventHandlers__ = [];
            }
            if (!me.__eventHandlers__[name]) {
                me.__eventHandlers__[name] = [];
            }
            decacf.each(me.__eventHandlers__[name], function(existing) {
                if (handler !== existing) {
                    newHandlers.push(existing);
                }
            });
            me.__eventHandlers__[name] = newHandlers;
        }
    }

};

global.decaf = decaf;
