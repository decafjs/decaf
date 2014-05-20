DecafJS Timers Module
=====================

setTimeout(), clearTimeout(), setInterval(), clearInterval() implementation.

Note that it is just as easy to call process.sleep() in a loop.

Unlike in the browser, these timer functions run in a separate thread, so your timer will go off and your function
called from that thread.
