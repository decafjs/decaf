/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/8/13
 * Time: 5:19 PM
 */

/**
 * @class Threads
 *
 * JVM Threads support wrapped nicely as a JavaScript API
 */
/*global require, exports, decaf */
"use strict";

decaf.extend(exports, {
    Thread    : require('lib/Thread').Thread,
    Semaphore : require('lib/Semaphore').Semaphore,
    Condition : require('lib/Condition').Condition
});
