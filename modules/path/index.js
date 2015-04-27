/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 9/11/13
 * Time: 9:12 AM
 * To change this template use File | Settings | File Templates.
 */

/**
 * @class path
 * @singleton
 * Rough implementation of NodeJS path module, for compatibility.
 *
 * This module should be moved to its own repository.
 * @deprecated
 */
module.exports = {
    dirname: require('lib/dirname'),
    basename: require('lib/basename'),
    extname: require('lib/extname'),
    join: require('lib/join')
};
