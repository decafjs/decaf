/*!
 * Created with WebStorm.
 * User: mschwartz
 * Date: 10/11/13
 * Time: 5:35 PM
 */

/**
 * creates a random string (numbers and chars)
 * @member support
 * @static
 *
 * @param {Number} len length of key
 * @param {Number} mode determines which letters to use. null or 0 = all letters;
 *      1 = skip 0, 1, l and o which can easily be mixed with numbers;
 *      2 = use numbers only
 * @returns {String} random string
 */
function randomString(len, mode) {
    if (mode == 2) {
        var x = Math.random() * Math.pow(10,len);
        return Math.floor(x);
    }
    var keystr = '';
    for (var i=0; i<len; i++) {
        var x = Math.floor((Math.random() * 36));
        if (mode == 1) {
            // skip 0,1
            x = (x<2) ? x + 2 : x;
            // don't use the letters l (charCode 21+87) and o (24+87)
            x = (x==21) ? 22 : x;
            x = (x==24) ? 25 : x;
        }
        if (x<10) {
            keystr += String(x);
        }    else    {
            keystr += String.fromCharCode(x+87);
        }
    }
    return keystr;
}

module.exports = randomString;

