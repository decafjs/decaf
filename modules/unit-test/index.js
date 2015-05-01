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

var selectedTest = undefined;

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

function runSuite(suite, test) {
    selectedTest = test;
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
    if (selectedTest && description !== selectedTest) {
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
        dir  = new File(path);

    decaf.each(dir.list(/\.js$/), function (filename) {
        var fn = new Function(new File((path + '/' + filename).replace(/\/\//g, '/')).readAll());
        fn();
    });

    if (global.arguments.length > 1) {
        for (var i = 1; i < global.arguments.length; i++) {
            var name = global.arguments[i],
                testToRun = undefined;
            if (~name.indexOf('.')) {
                name = name.split('.');
                testToRun = name[1];
                name = name[0];
            }
            decaf.each(suites, function (suite) {
                if (suite.description === name) {
                    runSuite(suite, testToRun);
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
    assert    : global.assert
});
