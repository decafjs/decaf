/*!
 * Created by mschwartz on 4/29/15.
 */
/**
 * Unit test framework
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
        dir = new File(path);

    decaf.each(dir.list(/\.js$/), function(filename) {
        include((path + '/' + filename).replace(/\/\//g, '/'));
    });

    if (global.arguments.length) {
        decaf.each(arguments, function(name) {
            decaf.each(suites, function(suite) {
                if (suite.description === name) {
                    runSuite(suite);
                }
            })
        })
    }
    else {
        decaf.each(suites, function(suite) {
            runSuite(suite);
        });
    }
}


decaf.extend(exports, {
    test_main : test_main,
    suite     : suite,
    test      : test,
    assert    : global.assert
});
