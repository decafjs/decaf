/*!
 * Created by mschwartz on 3/14/15.
 */

/*global global */

(function() {
    var testNumber = 1;
    function describe(description, fn) {
        testNumber = 1;
        console.log('--------------------');
        console.log('Unit Test: ' + description);
        if (fn() !== false) {
            console.log('    SUCCEEDED');
        }
    }
    function it(description, fn) {
        console.log('- Test #' + testNumber + ': ' + description);
        testNumber++;
        return fn();
    }

    global.describe = describe;
    global.it = it;

}());
