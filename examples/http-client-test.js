/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/24/13
 * Time: 10:41 AM
 * To change this template use File | Settings | File Templates.
 */

var Client = require('http').Client;

debugger;
var client = new Client('http://google.com').get();
console.dir(client, 1);