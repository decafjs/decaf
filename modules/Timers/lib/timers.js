/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 3:24 PM
 */

/** @module timers */

/*global exports */
"use strict";

var counter = 1;
var ids = {};

/**
 *
 * @param fn
 * @param delay
 * @returns {number}
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
 *
 * @param id
 */
var clearTimeout = function (id) {
    var timer = ids[id].timer;
    timer.cancel();
    delete ids[id];
    timer.purge();
};

/**
 *
 * @param fn
 * @param delay
 * @returns {number}
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
}

/**
 *
 * @param id
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
