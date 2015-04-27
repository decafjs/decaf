/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 9/11/13
 * Time: 9:13 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @method basename
 * @member path
 * @param p
 * @param ext
 * @returns {*}
 */
module.exports = function(p, ext) {
    if (!p) {
        return p;
    }
    var baseIndex = p.lastIndexOf('/');
    if (baseIndex === -1) {
        return p;
    }
    p = p.substr(baseIndex);
    if (ext && p.substr(-1 * ext.length) === ext) {
        p = p.substr(0, p.length - ext.length);
    }
    return p;
};
