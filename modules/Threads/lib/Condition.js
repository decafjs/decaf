/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/2/13
 * Time: 4:57 PM
 * To change this template use File | Settings | File Templates.
 */

// condition variables (untested)

/*global sync, exports, java */
"use strict";

/**
 * @class Threads.Condition
 * A condition instance provides a mechanism for one thread to wait until the Condition is notified by another thread.
 *
 * ### Example:
 *
 * ```javascript
 * var Condition = require('Threads').Condition;
 *
 * var condition = new Condition();
 * condition.wait();
 * console.log('condition was notified');
 * 
 * // in some other thread:
 * condition.notify();
 * ```
 *
 * @constructor
 * Create a new Condition instance.
 */
function Condition() {
    var me = this;

    /** @private */
    me.variable = new java.lang.Object();

    /**
     * Wait for a notify.
     *
    this.wait = sync(function () {
        me.variable.wait();
    }, me.variable);

    /**
     * Notify listeners on this Condition instance.
     */
    this.notify = sync(function () {
        me.variable.notify();
    }, me.variable);

    /**
     * Notify all threads waiting on this Condition instance.
     */
    this.notifyAll = sync(function () {
        me.variable.notifyAll();
    }, me.variable);
}
decaf.extend(Condition.prototype, {
    /**
     * Destroy condition variable
     */
    destroy : function () {
        this.notifyAll();
    }
});

decaf.extend(exports, {
    Condition : Condition
});
