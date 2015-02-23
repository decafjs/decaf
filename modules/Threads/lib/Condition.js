/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/2/13
 * Time: 4:57 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @module Threads
 */

// condition variables (untested)

/*global sync, exports, java */
"use strict";

/**
 * A condition instance provides a mechanism for one thread to wait until the Condition is notified by another thread.
 *
 * @class Conditional
 * @constructor
 */
function Condition() {
    var me = this;

    /** @private */
    me.variable = new java.lang.Object();

    /**
     * Wait for a notify.
     *
     * @method wait
     */
    this.wait = sync(function () {
        me.variable.wait();
    }, me.variable);

    /**
     * Notify
     *
     * @method notify
     */
    this.notify = sync(function () {
        me.variable.notify();
    }, me.variable);

    /**
     * Notify all threads waiting on this Condition instance.
     *
     * @method notifyAll
     */
    this.notifyAll = sync(function () {
        me.variable.notifyAll();
    }, me.variable);
}
decaf.extend(Condition.prototype, {
    /**
     * Destroy condition variable
     *
     * @method destroy
     */
    destroy : function () {
        this.notifyAll();
    }
});

decaf.extend(exports, {
    Condition : Condition
});
