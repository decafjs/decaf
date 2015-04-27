/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 3:24 PM
 */

/**
 * @class Timers
 * Broser-like implementations of setTimeout, clearTimeout, setInterval, and clearInterval.
 *
 * Note that the callback functions will be called in a different thread!
 */
/*global exports */
"use strict";

var counter = 1;
var ids = {};

/**
 * Set a one-shot timer, call the specified function when the timer elapses.
 *
 * @param {Function} fn function to call when timer elapses
 * @param {Number} delay number of milliseconds to delay
 * @returns {Number} id of timer
 */
var setTimeout = function (fn, delay) {
    var timer = new java.util.Timer(false);
    var id = counter++;

    ids[id] = {
        timer: timer,
        task : new JavaAdapter(java.util.TimerTask, {
            run: function () {
                fn();
                clearTimeout(id);
            }
        })
    };
    timer.schedule(ids[id].task, delay);
    return id;
};

/**
 * Cancel a timeout timer.
 *
 * @param {Number} id id of timer to cancel.
 */
var clearTimeout = function (id) {
    var timer = ids[id].timer;
    timer.cancel();
    delete ids[id];
    timer.purge();
};

/**
 * Set an Interval Timer
 *
 * @param {Function} fn function to call each interval.
 * @param {Number} delay how often to call function, in millseconds.
 * @returns {number} id id of timer, to be used with clearInterval()
 */
var setInterval = function (fn, delay) {
    var id = counter++;
    var timer = new java.util.Timer(false);
    ids[id] = {
        timer: timer,
        task : new JavaAdapter(java.util.TimerTask, {run: fn})
    };
    timer.schedule(ids[id].task, delay, delay);
    return id;
};

/**
 * Cancel an interval timer
 *
 * @param {Number} id id of timer to cancel.
 */
var clearInterval = function (id) {
    var timer = ids[id].timer;
    timer.cancel();
    delete ids[id];
    timer.purge();
};

decaf.extend(exports, {
    setTimeout   : setTimeout,
    clearTimeout : clearTimeout,
    setInterval  : setInterval,
    clearInterval: clearInterval
});
