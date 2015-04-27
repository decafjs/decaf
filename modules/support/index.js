/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 8/26/13
 * Time: 5:50 PM
 */

/**
 * @class support
 * @singleton
 *
 * The support namespace provides utility methods, mostly encryption.
 *
 */
/*global require, module */
/** @private */
module.exports = {
    uuid          : require('lib/uuid'),
    md5           : require('lib/md5'),
    sha1          : require('lib/sha1'),
    utf8_encode   : require('lib/utf8_encode'),
    randomString  : require('lib/randomString'),
    base64_encode : require('lib/base64_encode'),
    BCrypt        : require('lib/bcrypt').BCrypt
};
