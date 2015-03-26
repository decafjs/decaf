/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/2/13
 * Time: 3:37 PM
 * To change this template use File | Settings | File Templates.
 */

/*global java */

"use strict";

var TimeUnit      = java.util.concurrent.TimeUnit,
    ReentrantLock = java.util.concurrent.locks.ReentrantLock;

/**
 * A semaphore to enable control of access to critical sections of code or data structures.
 *
 * A semaphore is owned by the thread that last successfully obtained a lock on it and that has not unlocked it.
 *
 * @module Threads
 */

/**
 * @class Semaphore
 * @constructor
 */
function Semaphore() {
    this.sem = new ReentrantLock();
}

decaf.extend(Semaphore.prototype, {
    /**
     * Lock the semaphore.  Blocks the caller until the lock is obtained.
     *
     * @method lock
     */
    lock : function () {
        this.sem.lock();
    },

    /**
     * Try to acquire the lock, with optional timeout
     *
     * @method trLock
     * @param {int} timeout - optional timeout in ms
     */
    tryLock : function (timeout) {
        return timeout ? this.sem.trylock(timeout, TimeUnit.MILLISECONDS) : this.sem.trylock();
    },

    /**
     * Unlock the semaphore.
     *
     * @method unlock
     */
    unlock : function () {
        this.sem.unlock();
    },

    /**
     * Determine if current thread is owner of the lock on a Sempahore.
     *
     * @method isMine
     * @returns {boolean} mine - true if current thread holds the lock on the Semaphore
     */
    isMine : function () {
        return this.sem.isHeldByCurrentThread();
    }

});

decaf.extend(exports, {
    Semaphore : Semaphore
});
