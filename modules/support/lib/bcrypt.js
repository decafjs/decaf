/*!
 * Created by alexandrulazar on 3/16/15.
 */
/*global java, module */

/**
 * @method BCrypt
 * @member support
 *
 * BCrypt encrtoption methods
 *
 * ## Example:
 *
 * ```javascript
 * var hashed = BCrypt.hashpw("moduscreate", BCrypt.gensalt());
 *
 * if (BCrypt.checkpw("moduscreate", hashed)){
 *    // it matches
 * }
 * ```
 */

var JBCrypt = Packages.org.mindrot.jbcrypt.BCrypt;

decaf.extend(exports, {
    BCrypt : JBCrypt,
    saltLength: 12,
    hashpw: function(password) {
        return String(JBCrypt.hashpw(password, JBCrypt.gensalt(this.saltLength)));
    },
    compare: function(candidate, hashed) {
        return !!JBCrypt.checkpw(candidate, hashed);
    }
});
//module.exports.BCrypt = BCrypt;
