/**
 * @class support
 */

/**
 * @method uuid
 * @static
 *
 * Generate something like a UUID
 *
 * @returns {string} 38 character UUID-like string
 */
function uuid() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

module.exports = uuid;
