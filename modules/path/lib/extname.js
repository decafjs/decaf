/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 9/11/13
 * Time: 9:13 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Return the extension of the path, from the last '.' to end of string in the last portion of the path. If there is no '.' in the last portion of the path or the first character of it is '.', then it returns an empty string.
 *
 * @param {string} p - path
 * @returns {string} extension - extension or empty string
 */
module.exports = function(p) {
    if (!p || p[0] === '.') {
        return '';
    }
    var dotIndex = p.lastIndexOf('.');
    if (dotIndex === -1) {
        return '';
    }
    return p.substr(dotIndex);
};
