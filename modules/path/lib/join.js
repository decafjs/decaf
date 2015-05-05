/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 9/11/13
 * Time: 9:12 AM
 * To change this template use File | Settings | File Templates.
 */

var File = require('File');

/**
 * @method join
 * @member path
 * @returns {*|string}
 */
module.exports = function() {
    var args = Array.prototype.slice.call(arguments, 1),
        path = args.join('/').replace(/\/\//g, '/'),
        f = new File(path);

    return f.getAbsolutePath();
};
