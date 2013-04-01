var Fs = require('fs');
var xfs_async = require('./lib/async');
var xfs_sync = require('./lib/sync');
/**
 * extends function from Fs, exclude override
 */
for (var i in Fs) {
  if (Fs.hasOwnProperty(i)) {
    exports[i] = Fs[i];
  }
}

/**
 * rmdir 递归删除目录，异步回调
 *         支持dir / file删除, 如果文件不存在，则默认删除成功
 * @param path    file path
 * @param callback
 */
exports.rmdir = xfs_async.rm;
exports.rm = xfs_async.rm;
/**
 * mkdir 递归的创建目录，异步回调
 *         如果文件目录存在，则默认返回成功
 * @param path
 * @param callback
 */
exports.mkdir = xfs_async.mkdir;
/**
 * rename 移动文件,异步回调，支持跨device移动
 * @param {path} src 
 * @param {path} dest 
 * @param {function} cb
 **/
exports.rename = xfs_async.mv;
exports.mv = xfs_async.mv;

/**
 * writeTo 写文件，如果目录不存在自动创建
 * @param {path} path
 * @param {String|Buffer} data
 * @param {Function} cb(err);
 */
exports.writeFile = xfs_async.writeFile;