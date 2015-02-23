/**
 * Created by mschwartz on 12/2/13.
 */

/**
 * @module global
 * @class decaf
 */
var decaf = {

    /**
     * Iterate over an object or array, calling the specified function for each member.
     *
     * The called function has the following signature:
     *
     *     function callback(item, index) {
     *       // use item
     *     }
     *
     * @method each
     * @param {Object|Array} o - object or array to iterate over
     * @param {Function} fn - function to be called for each
     */
    each   : function ( o, fn ) {
        for ( var key in o ) {
            if ( o.hasOwnProperty && o.hasOwnProperty(key) ) {
                if ( fn.call(o, o[ key ], key, o) === false ) {
                    return;
                }
            }
        }
    },
    /**
     * Merge one or more Objects to a destination object
     *
     * This can be used to extend a JavaScript class or prototype.  It is heavily used throughout the DecafJS source
     * code.
     *
     * This function is smart enough to merge getter and setter functions rather than the values those get or set.  Unlike
     * AngularJS and jQuery implementations.
     *
     * @method extend
     * @param {Object} me - the destination object
     * @param [...Object] objects - the objects to merge
     * @returns {Object} the merged (destination) object.
     */
    extend : function ( me ) {
        var args = Array.prototype.slice.call(arguments, 1);
        decaf.each(args, function ( o ) {
            for ( var key in o ) {
                if ( o.hasOwnProperty(key) ) {
                    var desc = Object.getOwnPropertyDescriptor(o, key),
                        g = desc.get, s = desc.set;
                    if ( g || s ) {
                        Object.defineProperty(me, key, { get : g, set : s, enumerable : true });
                    }
                    else {
                        me[ key ] = o[ key ];
                    }
                }
            }
        });
        return me;
    },
    /**
     * Convert a JavaScript string or array into a Java Byte Array.
     *
     * @method toJavaByteArray
     * @param {String|Array} thing - what to convert
     * @param {String} encoding - how to encode the array (e.g. UTF-8, etc.)
     * @returns The Java Byte Array
     */
    toJavaByteArray : function ( thing, encoding ) {
        if ( typeof thing === 'string' ) {
            return encoding ? new java.lang.String(thing).getBytes(encoding) : new java.lang.String(thing).getBytes();
        }
        else {
            var len = thing.length;

            var v = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, len);
            try {
                for ( var i = 0; i < len; i++ ) {
                    v[ i ] = thing[ i ];
                }
            }
            catch ( e ) {
                throw new Error('Array.toJavaByteArray - array contains invalid values');
            }
            return v;
        }
    },
    /**
     * Returns true if the passed value is empty.
     *
     * The value is deemed to be empty if it is:
     *
     * * null
     * * undefined
     * * an empty array
     * * a zero length string (unless the allowBlank parameter is true)
     *
     * @method isEmpty
     * @param {Mixed} value - The value to test
     * @param {Boolean} allowBlank - (optional) true to allow empty strings (defaults to false)
     * @return {Boolean} result
     */
    isEmpty : function ( value, allowBlank ) {
        return value === null || value === undefined || ((decaf.isArray(value) && !value.length)) || (!allowBlank ? v === '' : false);
    },
    /**
     * Returns true if the passed value is a JavaScript array, otherwise
     * false.
     * @method isArray
     * @param {Mixed} value - The value to test
     * @return {Boolean} result
     */
    isArray : function ( value ) {
        return toString.apply(value) === '[object Array]';
    },
    /**
     * Returns true if the passed object is a JavaScript date object,
     * otherwise false.
     *
     * @method isDate
     * @param {Object} object - The object to test
     * @return {Boolean} result
     */
    isDate : function ( object ) {
        return toString.apply(object) === '[object Date]';
    },
    /**
     * Returns true if the passed value is a JavaScript Object, otherwise
     * false.
     *
     * @method isObject
     * @param {Mixed} value - The value to test
     * @return {Boolean} result
     */
    isObject : function ( v ) {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },
    /**
     * Returns true if the passed value is a JavaScript 'primitive', a
     * string, number or boolean.
     *
     * @method isPrimitive
     * @param {Mixed} v - value The value to test
     * @return {Boolean} - result
     */
    isPrimitive : function ( v ) {
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
    isFunction : function ( v ) {
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
    isNumber : function ( v ) {
        return typeof v === 'number' && isFinite(v);
    },

    /**
     * Returns true if the passed value is a string.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isString : function ( v ) {
        return typeof v === 'string';
    },

    /**
     * Returns true if the passed value is a boolean.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isBoolean : function ( v ) {
        return typeof v === 'boolean';
    },

    /**
     * Returns true if the passed value is not undefined.
     *
     * @param {Mixed}
     *            value The value to test
     * @return {Boolean}
     */
    isDefined : function ( v ) {
        return typeof v !== 'undefined';
    },

    /**
     * observable mixin
     */
    observable : {
        on   : function ( name, handler ) {
            var me = this;

            if ( !me.__eventHandlers__ ) {
                me.__eventHandlers__ = [];
            }
            if ( !me.__eventHandlers__[ name ] ) {
                me.__eventHandlers__[ name ] = [];
            }
            me.__eventHandlers__[ name ].push(handler);
        },
        fire : function ( event ) {
            var me = this;
            if ( me.__eventHandlers__[ event ] ) {
                var args = Array.prototype.splice.call(arguments, 1);
                decaf.each(me.__eventHandlers__[ event ] || [], function ( fn ) {
                    fn.apply(me, args);
                });
            }
        },
        un   : function ( name, handler ) {
            var me = this,
                newHandlers = [];
            if ( !me.__eventHandlers__ ) {
                me.__eventHandlers__ = [];
            }
            if ( !me.__eventHandlers__[ name ] ) {
                me.__eventHandlers__[ name ] = [];
            }
            decacf.each(me.__eventHandlers__[ name ], function ( existing ) {
                if ( handler !== existing ) {
                    newHandlers.push(existing);
                }
            });
            me.__eventHandlers__[ name ] = newHandlers;
        }
    }

};

global.decaf = decaf;
