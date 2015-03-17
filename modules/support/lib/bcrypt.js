/**
 * Created by alexandrulazar on 3/16/15.
 */
/*global java, module */

var {BCrypt} = Packages.org.mindrot.jbcrypt;

/**
 * Usage:
 *
 * var hashed = BCrypt.hashpw("moduscreate", BCrypt.gensalt());
 *
 * if (BCrypt.checkpw("moduscreate", hashed)){
 *   // it matches
 * }
 * */

module.exports.BCrypt = BCrypt;
