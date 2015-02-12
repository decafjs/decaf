// Demonstrate threads in Decaf
var Thread = require('Threads').Thread;

var sharedGlobal = 0;

// decaf will call main() after initialization
function main() {
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            console.log('sharedGlobal = ' + sharedGlobal);
        }
    }).start();
    new Thread(function() {
        while (1) {
            Thread.sleep(1);
            sharedGlobal++;
        }
    }).start();
}

