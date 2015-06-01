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
    BCrypt     : JBCrypt,       // for backward compatibility
    saltLength : 12,
    hashpw     : function (password, salt) {
        salt = salt || JBCrypt.gensalt(this.saltLength);
        return String(JBCrypt.hashpw(password, salt));
    },
    gensalt    : function (len) {
        return String(JBCrypt.gensalt(len));
    },
    compare    : function (candidate, hashed) {
        return !!JBCrypt.checkpw(candidate, hashed);
    }
});
//module.exports.BCrypt = BCrypt;
