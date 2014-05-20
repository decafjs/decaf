var vertx = require('vertx');

  vertx.createHttpServer().requestHandler(function(req) {
      req.response.end('Hello World\n');
  }).listen(8080)
