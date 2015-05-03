/*!
 * Created by mschwartz on 4/29/15.
 */
/**
 * @class Tests
 * @singleton
 *
 * Unit test framework
 *
 * ## example
 *
 * ### file: tests/File.js
 * ```javascript
 * // general initialization
 * var File = require('File'),
 *     tmpdir = File.tmpDir;
 *
 * // one or more test suites
 * suite('File', function() {
 *    // one or more tests
 *    test('require', function() {
 *        assert(File, 'require of File failed');
 *        assert(typeof File === 'function', 'Expected File to be a constructor');
 *        assert(typeof File.pathSeparator === 'string', 'static File.pathSeparator is not a string');
 *        assert(File.pathSeparator === ':' || File.pathSeparator === ';', 'static File.pathSeparator expected to be ":" or ":"');
 *        assert(typeof File.separatorChar === 'string', 'static File.separatorChar is not a string');
 *        assert(File.separatorChar === '/' || File.separatorChar === '\\', 'static File.separatorChar expected to be "/" or "\\" ' + File.separatorChar);
 *    });
 * });
 *```
 *
 * ### file: test.js
 *
 * ```javascript
 * var {suite, test, assert, test_main} = require('Tests');
 * test_main('tests');    // loads al files in tests/ directory and runs the ones specified on the command line or runs them all
 * ```
 *
 * ### file: test.sh
 *
 * ```sh
 * #!/bin/sh
 *
 * ./bower_components/decaf/bin/decaf test.js $*
 *```
 *
 * From the command line, you can run:
 *
 * ```sh
 * $ ./test.sh                  # runs all tests
 * $ ./test.sh File             # runs only File suite
 * $ ./test.sh File.require     # runs only the require test within File suite
 * ```
 *
 * Multiple Suite[.test] may be provided on the command line.
 *
 */

/**
 * @private
 * @type {number}
 */
var testNumber = 0;

/**
 * @private
 * @type {Array}
 */
var suites = [];

/**
 * @private
 * @type {Array}
 */
var selectedTests = [];

/**
 * Declare a test suite
 *
 * @param {String} description/name of suite
 * @param {Function} fn body of suite tests to be run
 */
function suite(description, fn) {
    suites.push({
        description : description,
        fn          : fn
    });
}

function runSuite(suite) {
    testNumber = 1;
    console.log('--------------------');
    console.log('Unit Test: ' + suite.description);
    if (suite.fn() !== false) {
        console.log('    SUCCEEDED');
    }
}

/**
 * Declare an individual test within a suite
 *
 * @param {String} description
 * @param {Function} fn body of the test to be run
 * @returns {Boolean} true if test succeeded
 */
function test(description, fn) {
    if (selectedTests.length && selectedTests.indexOf(description) === -1) {
        return true;
    }
    console.log('- Test #' + testNumber + ': ' + description);
    testNumber++;
    return fn();
}

/**
 * Main program for unit tests.  Call it with a path to a directory containing unit test .js files.
 *
 * @param path
 */
function test_main(path) {
    var File = require('File'),
        dir;

    decaf.each(arguments, function(path) {
        dir  = new File(path);

        decaf.each(dir.list(/\.js$/), function (filename) {
            require((path + '/' + filename).replace(/\/\//g)); // new Function(new File((path + '/' + filename).replace(/\/\//g, '/')).readAll());
        });

    });

    if (global.arguments.length > 1) {
        for (var i = 1; i < global.arguments.length; i++) {
            var name = global.arguments[i];
            if (~name.indexOf('.')) {
                selectedTests = name.split('.');
                name = selectedTests.shift();
            }
            else {
                selectedTests = [];
            }
            decaf.each(suites, function (suite) {
                if (suite.description === name) {
                    runSuite(suite);
                }
            })
        }
    }
    else {
        decaf.each(suites, function (suite) {
            runSuite(suite);
        });
    }
}


decaf.extend(exports, {
    test_main : test_main,
    suite     : suite,
    test      : test,
    assert    : require('lib/assert').assert
});
