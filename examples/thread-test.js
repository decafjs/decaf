// Demonstrate threads in Decaf
var Thread = require('Threads').Thread;

var sharedGlobal = 0;

function main() {
    new Thread(function() {
        Thread.sleep(1);
        console.log('sharedGlobal = ' + sharedGlobal);
    }).start();
    new Thread(function() {
        Thread.sleep(1);
        sharedGlobal++;
    }).start();
}

