/*!
 * Created by mschwartz on 3/14/15.
 */

/**
 * @class assert
 * @singleton
 *
 * Expression verification.
 *
 * ## Example:
 * ```sh
 * $ ./bin/decaf
 * decaf> assert(1 === 1)
 * true
 * decaf> assert(1 === 1, 'false', 'true')
 * true
 * at unknown:1
 * true
 * decaf> assert(1 === 0)
 * Assertion failed
 * at unknown:1
 *
 * exiting
 * $
 * ```
 */
/*global global */


(function () {

    /**
     * Assert that the bool value is true.
     *
     * If it is true, assert() prints the optional trueMessage string (parameter) and returns true.
     *
     * If the bool value is false then 'Assertion failed' is printed and assert.exit() is called.  Behavior of failed assertions can be programmatically controlled:
     *
     * - the optional falseMessage can be provided for a string to be printed instead of 'Assertion failed'
     * - if assert.exit is set to false, then assert() returns false and does not exit
     * - the method assert.message(message) may be replaced by one that does application specific logic
     *
     * @param {Boolean} value the value to test
     * @param {String} falseMessage the optional string to be printed instead of 'Assertion failed'
     * @param {String} trueMessage the optional string to be printed if the assertion is successful (true)
     */
    function assert(value, falseMessage, trueMessage) {
        if (value) {
            if (trueMessage) {
                assert.message(trueMessage);
            }
            return true;
        }
        if (typeof falseMessage === 'function') {
            assert.message(falseMessage());
        }
        else {
            assert.message(falseMessage || 'Assertion failed');
        }
        if (assert.exit) {
            builtin.process.exit(1);
        }
        return false;
    }

    // assert is global
    global.assert = assert;

    /**
     * @member assert
     * Print the message parameter along with the line and file where assert() was called
     * @param message
     */
    assert.message = function (message) {
        try {
            throw new Error();
        }
        catch (e) {
            var stack = e.stack.split('\n');
            var line = stack[2];
        }
        console.error(message);
        console.error(line);
    };

    /**
     * @property exit
     * @member assert
     * The setting of this member determines if the program exits when an assert() fails.
     *
     * A program may want to set this to false
     *
     * @type {boolean}
     */
    assert.exit = true;

}());
