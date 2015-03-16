/*global builtin, java */

"use strict";
var process = require('process');

var threads      = {},
    javaThreads  = {},
    nextThreadId = 0;

function allocThreadId() {
    while (true) {
        ++nextThreadId;
        nextThreadId %= 65536;
        if (!threads[nextThreadId]) {
            return nextThreadId;
        }
    }
}

/** @module Thread */

/**
 * Create a new Thread
 *
 * Note: the thread isn't started, it is only created
 *
 * @class Thread
 * @param {Function} fn - function to run as thread
 * @constructor
 */
function Thread(fn) {
    var args = [];
    for (var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
    }
    decaf.extend(this, {
        fn        : fn,
        args      : args,
        lockCount : 0,
        listeners : {},
        data      : {},
        threadId  : allocThreadId()
    });
    threads[this.threadId] = this;
}

/**
 * Exit the currently running thread
 *
 * @method exit
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
 * @method currentThread
 */
Thread.currentThread = function () {
    var t = java.lang.Thread.currentThread();
    return javaThreads[t.getId()] || mainThread;
};

/**
 * Defer to other running threads for specified number of seconds.
 *
 * @method sleep
 * @param secs
 */
Thread.sleep = function (secs) {
    process.sleep(secs);
};

/**
 * Defer to other running threads for specified number of milliseconds
 *
 * @method usleep
 * @param usecs
 */
Thread.usleep = function (usecs) {
    process.usleep(usecs);
};

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

        me.javaThreadId = t.getId();
        javaThreads[me.javaThreadId] = me;
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
        delete javaThreads[me.javaThreadId];
        delete threads[me.threadId];
    }
});

exports.Thread = Thread;
