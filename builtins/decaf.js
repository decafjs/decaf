/*!
 * Created by mschwartz on 12/2/13.
 */

/*global toString */

/**
 * # Bulitin global decaf singleton
 *
 * This singleton contains a number of general purpose static methods.  The decaf instance (and methods) are available in any JavaScript context within a DecafJS program.
 *
 * @class decaf
 * @singleton
 */
/** @private */
var decaf = {
    /**
     * ## decaf.each(o, fn)
     *
     * Iterate over an object or array, calling the specified function for each member.
     *
     * #### Arguments:
     *  - o - the object to iterate over
     *  - fn - the function to be called with each member of the object
     *
     * The called function has the following signature:
     *
     *     function callback(item, index) {
     *       // use item
     *     }
     *
     * If the function returns false, the iteration will not continue.
     *
     * @method each
     * @param {Object|Array} o - object or array to iterate over
     * @param {Function} fn - function to be called for each
     */
    each             : function ( o, fn ) {
        for ( var key in o ) {
            if ( o.hasOwnProperty && o.hasOwnProperty(key) ) {
                if ( fn.call(o, o[ key ], key, o) === false ) {
                    return;
                }
            }
        }
    },
    /**
     * ## decaf.extend(dest, src [, src...]) : dest (chainable)
     *
     * Merge one or more Objects to a destination object
     *
     * This can be used to extend a JavaScript class or prototype.  It is heavily used throughout the DecafJS source
     * code.
     *
     * This function is smart enough to merge getter and setter functions rather than the values those get or set.  Unlike
     * AngularJS and jQuery implementations.
     *
     * #### Arguments:
     *  - {object} dest - the object that will be the result of the object merges.
     *  - {object} src... - one or more objects to be merged into the result (dest) object
     *
     * #### Returns:
     *  - {object} - dest - the destination/result object
     *
     * @method extend
     * @param {Object} me - the destination object
     * @param [...Object] objects - the objects to merge
     * @returns {Object} the merged (destination) object.
     */
    extend           : function ( me ) {
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
     * ## decaf.toJavaByteArray(thing, encoding) : Java ByteArray
     *
     * Convert a JavaScript string or array into a Java ByteArray.
     *
     * ### Arguments:
     * - {String|Array} thing - what to convert to ByteArray
     * - {String} encoding - optional encoding for the ByteArray (e.g. UTF-8, etc.)
     *
     * ### Returns:
     * - {Java ByteArray} thing as a Java ByteArray
     * @method toJavaByteArray
     * @param {String|Array} thing - what to convert
     * @param {String} encoding - how to encode the array (e.g. UTF-8, etc.)
     * @returns The Java Byte Array
     */
    toJavaByteArray  : function ( thing, encoding ) {
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
     * ## decaf.newJavaByteArray(len) : Java ByteArray
     *
     * Allocate a new Java Byte Array
     *
     * ### Arguments:
     * - {Number} len - size of the array to be created
     *
     * ### Returns:
     * - {Java Byte Array} - the allocated Java ByteArray
     *
     * @param len
     * @returns {*}
     */
    newJavaByteArray : function ( len ) {
        return java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, len);
    },
    /**
     * ## decaf.isEmpty(value) : boolean
     *
     * Test a variable to see if it's "empty."
     *
     * ### Arguments:
     *  - {mixed} value - a JavaScript variable to be tested
     *
     * ### Returns:
     * - true if the passed value is empty.
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
    isEmpty          : function ( value, allowBlank ) {
        return value === null || value === undefined || ((decaf.isArray(value) && !value.length)) || (!allowBlank ? value === '' : false);
    },
    /**
     * ## decaf.isArray(value) : boolean
     *
     * Test a variable to see if it's an array
     *
     * ### Arguments:
     * - {mixed} value - the variable to be tested
     *
     * ### Returns:
     *  - true if the passed value is a JavaScript array, otherwise false.
     *
     * @method isArray
     * @param {Mixed} value - The value to test
     * @return {Boolean} result
     */
    isArray          : function ( value ) {
        return toString.apply(value) === '[object Array]';
    },
    /**
     * ## decaf.isDate(value) : boolean
     *
     * Test a variable to see if it's a JavaScript Date object
     *
     * ### Arguments:
     * - {Mixed} value - the variable to be tested
     *
     * ### Returns:
     * - true if the passed object is a JavaScript date object, otherwise false.
     *
     * @method isDate
     * @param {Object} value - The object to test
     * @return {Boolean} result
     */
    isDate           : function ( value ) {
        return toString.apply(value) === '[object Date]';
    },
    /**
     * ## decaf.isObject(value) : boolean
     *
     * Test a variable to see if it is a JavaScript Object.
     *
     * ### Arguments:
     * - {Mixed} value - variable to test
     *
     * ### Returns:
     * - true if the passed value is a JavaScript Object, otherwise false.
     *
     * @method isObject
     * @param {Mixed} value - The value to test
     * @return {Boolean} result
     */
    isObject         : function ( value ) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    },
    /**
     * ## decaf.isPrimitive(value) : boolean
     *
     * Test a variable to see if it's a JavaScript primitive.
     *
     * A primitive is:
     * - a string,
     * - a number
     * - a boolean
     *
     * ### Arguments:
     * - {Mixed} value - the variable to be tested.
     *
     * ### Returns:
     * - true if the passed value is a JavaScript 'primitive'
     *
     * @method isPrimitive
     * @param {Mixed} value - value The value to test
     * @return {Boolean} - result
     */
    isPrimitive      : function ( value ) {
        return Util.isString(value) || Util.isNumber(value) || Util.isBoolean(value);
    },
    /**
     * ## decaf.isFunction(value) : boolean
     *
     * Test a variable to see if it is a Function.
     *
     * ### Arguments
     * - {Mixed} value - variable to be tested.
     *
     * ### Returns:
     * - true if the passed value is a JavaScript Function, otherwise false
     *
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isFunction       : function ( value ) {
        return toString.apply(value) === '[object Function]';
    },
    /**
     * ## decaf.isNumber(value) : boolean
     *
     * Test a variable to see if it is a number.
     *
     * ### Arguments:
     * - {Mixed} value - value to test
     *
     * ### Returns:
     * - true if the passed value is a number. Returns false for non-finite numbers.
     *
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isNumber         : function ( value ) {
        return typeof value === 'number' && isFinite(value);
    },
    /**
     * decaf.isString(value) : boolean
     *
     * Test a variable to see if it is a String.
     *
     * ### Arguments:
     * - {Mixed} value - variable to test
     *
     * ###Returns:
     * - true if the passed value is a string.
     *
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isString         : function ( value ) {
        return typeof value === 'string';
    },
    /**
     * ## decaf.isBoolean(value) : boolean
     *
     * Test a variable to see if it is a boolean type.
     *
     * ### Arguments:
     * - {Mixed} value - the variable to test
     *
     * ### Returns:
     * - true if the passed value is a boolean.
     *
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isBoolean        : function ( value ) {
        return typeof value === 'boolean';
    },
    /**
     * ## decaf.isDefined(variable) : boolean
     *
     * Test a variable to see if it is defined (not undefined)
     *
     * ### Arguments:
     * - {Mixed} value
     * ### Returns:
     * - true if the passed value is not undefined.
     *
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isDefined        : function ( value ) {
        return typeof value !== 'undefined';
    },
    /**
     * This is an observable mixin.  It provides a mechanism to add and remove multiple event listeners to, and to fire events on, any object that implements the mixin.
     *
     * Event names are any arbitrary string.  Classes that include this mixin may define the event names they supports.
     *
     * ### Example:
     *
     * ```javascript
     * function SomeClass() {
     *   this.name = 'SomeClass';
     *   ...
     * }
     * decaf.extend(SomeClass.prototype, decaf.observable);
     *
     * function eventHandler(s) {
     *   console.log(this.name + ': '  + s);
     * }
     *
     * var c = new SomeClass();
     * c.on('anyOldString', eventHandler);
     * c.fire('anyOldString', 'foo');
     * // -> the string "SomeClass: foo" is printed to the console by the event handler
     * c.un('anyOldString', eventHandler);
     * c.fire('anyOldString', 'foo');
     * // -> nothing is printed to the console since the event handler has been removed.
     * ```
     *
     * For purposes of the rest of the observable mixin documentation, the term "observable" implies an instance of an object that has applied the mixin.
     * @inheritable
     */
    observable       : {
        /**
         * ## observable.on(name, handler) : observable (chainable)
         *
         * Add an event handler/listener to an observable.
         *
         * ### Arguments:
         * - {String} name - name of event
         * - {Function) handler - the function to handle the event
         *
         * ### Returns:
         * - {Object} the observable (the function becomes chainable)
         *
         * @param name
         * @param handler
         */
        on   : function ( name, handler ) {
            var me = this;

            if ( !me.__eventHandlers__ ) {
                me.__eventHandlers__ = [];
            }
            if ( !me.__eventHandlers__[ name ] ) {
                me.__eventHandlers__[ name ] = [];
            }
            me.__eventHandlers__[ name ].push(handler);
            return me;
        },
        /**
         * ## observable.fire(event, ...) : observable (chainable)
         *
         * Fire an event with arbitrary additional arguments.
         *
         * All event handlers for the named event on the observable are called with the optional arguments.
         *
         * ### Arguments:
         * - {String} name - the name of the event to fire
         * - {Mixed} ... - zero or more arbitrary arguments to be passed to the event handlers.
         *
         * ### Returns:
         * - {Object} the observable (the function becomes chainable)
         *
         * @param event
         * @returns {decaf}
         */
        fire : function ( event ) {
            var me = this;
            if ( !me.__eventHandlers__ ) {
                me.__eventHandlers__ = [];
            }
            if ( me.__eventHandlers__[ event ] ) {
                var args = Array.prototype.splice.call(arguments, 1);
                decaf.each(me.__eventHandlers__[ event ] || [], function ( fn ) {
                    fn.apply(me, args);
                });
            }
            return me;
        },
        /**
         * ## observable.un(name, handler) : observable (chainable)
         *
         * Remove a listener/event handler from an observable.
         *
         * THe event handler will no longer be called for the specified event name.
         *
         * ### Arguments:
         * - {String} name - the name of the event
         * - {Function handler - the event handler function to remove
         *
         * Note that the arguments to un() should be the same as those to on() that installed the handler.
         *
         * ### Returns:
         * - {Object} the observable (the function becomes chainable)
         *
         * @param name
         * @param handler
         * @returns {decaf}
         */
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
            return me;
        }
        /** @private */
    }

};

global.decaf = decaf;
