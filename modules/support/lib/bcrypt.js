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
 *     @example
 *     var hashed = BCrypt.hashpw("moduscreate", BCrypt.gensalt());
 *
 *     if (BCrypt.checkpw("moduscreate", hashed)){
 *       // it matches
 *     }
 *
 */

var BCrypt = Packages.org.mindrot.jbcrypt.BCrypt;

module.exports.BCrypt = BCrypt;
