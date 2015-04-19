/*global builtin, java */

/*global exports */
"use strict";
var process = require('process');

var threads      = {},
    javaThreads  = {},
    threadCount  = 0,
    nextThreadId = 0;

var addThread = sync(function(threadId, thread) {
    threads[threadId] = thread;
    threadCount++;
}, threads);

var removeThread = sync(function(threadId) {
    if (threads[threadId]) {
        delete threads[threadId];
        threadCount--;
    }
}, threads);

//function allocThreadId() {
//    while (true) {
//        ++nextThreadId;
//        nextThreadId %= 65536;
//        if (!threads[nextThreadId]) {
//            return nextThreadId;
//        }
//    }
//}

/**
 * @class Threads.Thread
 * Threads implementation for DecafJS JavaScript programs.
 *
 * This class provides a JavaScript friendly wrapper around native JVM Threads.
 */

/**
 * @class Threads.Thread
 * @constructor
 * Create a new Thread
 *
 * Note: the thread isn't started, it is only created
 *
 * Any additional parameters to this function are passed as arguments to the function within the new thread context.
 *
 * For example:
 *
 * ```javascript
 * var Thread = require('Threads').Thread;
 *
 * new Thread(
 *   function(a,b) {
 *     console.log(a);
 *     console.log(b);
 * }, 1, 2).start();
 * // prints:
 * // 1
 * // 2
 * ```
 * @constructor
 * @param {Function} fn - function to run as thread
 * @param [Arguments] Zero or more arguments to be passed to fn
 */
function Thread(fn) {
    var args = [];
    for (var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
    }
    decaf.extend(this, {
        //threadId  : allocThreadId(),
        fn        : fn,
        args      : args,
        lockCount : 0,
        listeners : {},
        data      : {}
    });
    //threads[this.threadId] = this;
}

/**
 * Exit the currently running thread
 *
 * @method exit
 * @static
 */
Thread.exit = function () {
    // console.log('THREAD.EXIT');
    throw 'THREAD.EXIT';
};

/** @private */
var mainThread = {
    on : function () {

    }
};

/**
 * Get current Thread
 *
 * @static
 */
Thread.currentThread = function () {
    var t = java.lang.Thread.currentThread();
    return threads[t] || mainThread;
};

/**
 * Get the number of active threads.
 *
 * @static
 * @returns {number}  number of threads
 */
Thread.threadCount = function() {
    return threadCount;
};

/**
 * Defer to other running threads for specified number of seconds.
 *
 * @static
 * @param {Number}  seconds to sleep
 */
Thread.sleep = function (seconds) {
    process.sleep(seconds);
};

/**
 * Defer to other running threads for specified number of milliseconds
 *
 * @static
 * @param {Number}  milliseconds to sleep
 */
Thread.usleep = function (milliseconds) {
    process.usleep(milliseconds);
};

/**
 * Test to see if current thread has been interrupted.
 *
 * @static
 * @returns {Boolean} true if thread has been interrupted
 */
Thread.interrupted = function () {
    return java.lang.Thread.interrupted();
};

decaf.extend(Thread.prototype, {
    /**
     * Add an event listener on the thread.
     *
     * @method on
     * @param event
     * @param fn
     */
    on          : function (event, fn) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(fn);
    },
    /**
     * Fire an event on the thread.
     *
     * @metod fire
     * @param event
     */
    fire        : function (event) {
        var me = this;
        if (me.listeners[event]) {
            var args = [];
            for (var i = 1, len = arguments.length; i < len; i++) {
                args.push(arguments[i]);
            }
            decaf.each(me.listeners[event], function (fn) {
                fn.apply(me, args);
            });
        }
    },
    /**
     * Start the thread running
     *
     * @method start
     */
    start       : function () {
        var me = this;
        me.thread = new java.lang.Thread(new java.lang.Runnable({run : me.runHandler, scope : me})).start();
    },
    /**
     * Interrupt the thread
     */
    interrupt   : function () {
        this.thread.interrupt();
    },
    /**
     * @private
     * @method runHandler
     */
    runHandler  : function () {
        var me = this.scope,
            t = java.lang.Thread.currentThread();

        addThread(t, me);
        //me.javaThreadId = t.getId();
        //javaThreads[me.javaThreadId] = me;
        try {
            me.fn.apply(me, me.args);
        }
        catch (e) {
            if (e !== 'THREAD.EXIT') {
                console.log(e.toString());
            }
        }
        finally {
            me.exitHandler(me);
        }
    },
    /**
     *
     * @private
     * @method exitHandler
     * @param me
     */
    exitHandler : function (me) {
        me.fire('exit');
        if (me.lockCount) {
            // unlock any mutexes
        }
        removeThread(me);
        //delete javaThreads[me.javaThreadId];
        //delete threads[me.threadId];
    }
});

builtin.onIdle(function() {
    return threadCount != 0;
});

exports.Thread = Thread;
