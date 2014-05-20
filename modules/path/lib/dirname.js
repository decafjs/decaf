/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 9/11/13
 * Time: 9:13 AM
 * To change this template use File | Settings | File Templates.
 */
"use strict";
/*global module */

module.exports = function(p) {
    var parts = p.split('/');
    parts.pop();
    if (parts.length) {
        return parts.join('/');
    }
    return '.';
};
