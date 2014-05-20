/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/2/13
 * Time: 4:57 PM
 * To change this template use File | Settings | File Templates.
 */

/** @module Condition */

// condition variables (untested)

/*global sync, exports, java */
"use strict";

/**
 *
 * @constructor
 */
function Condition() {
    var me = this;
    me.variable = new java.lang.Object();
    /**
     *
     * @type {*}
     */
    this.wait = sync(function() {
        me.variable.wait();
    }, me.variable);

    /**
     *
     * @type {*}
     */
    this.notify = sync(function() {
        me.variable.notify();
    },me.variable);
    /**
     *
     * @type {*}
     */
    this.notifyAll = sync(function() {
        me.variable.notifyAll();
    },me.variable);
}
decaf.extend(Condition.prototype, {
    /**
     * Destroy condition variable
     *
     * @memberOf Condition
     */
    destroy: function() {
        this.notifyAll();
    }
});

decaf.extend(exports, {
    Condition: Condition
});
