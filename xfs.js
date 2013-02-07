/**
 * Fs enhance
 */
var Fs = require('fs');
var Path = require('path');

function testSync(args) {
  return typeof args[args.length - 1] === 'function' ? false : true;
}
/**
 * ========================================
 * remove dir
 * equal: rm -rf /a/b/c
 * @param  {[type]}   path [description]
 * @param  {Function} cb   [description]
 */
function _rmdir(path, cb) {
  
  Fs.readdir(path, function (e, files) {
    if (e) {
      if (e.code === 'ENOTDIR') {
        Fs.unlink(path, cb);
      } else if (e.code === 'ENOENT') {
        cb();
      } else {
        cb(e);
      }
      return;
    }
    var len = files.length;
    var count = 0;
    function pending(e) {
      if (e) {
        return cb(e);
      }
      count ++;
      if (count == len) {
        //finish dir child delete , then delete dir itself
        Fs.rmdir(path, cb);
      }
    }
    if (len) {
      var tmp_path;
      for (var i = 0; i < len; i ++) {
        tmp_path = Path.join(path, files[i]);
        _delFile(tmp_path, pending);
      }
    } else {
      Fs.rmdir(path, cb);
    }
  });
}

function _delFile(path, cb) {
  Fs.stat(path, function (e, st) {
    if (e) {
      return cb(e);
    }
    if (st.isDirectory()) {
      _rmdir(path, cb);
    } else if (st.isFile()) {
      try {
        Fs.unlink(path, cb);
      } catch (err) {
        cb(err, path);
      }
    }
  });
}

/**
 * =========================================
 * [_mkdir description]
 * @param  {[type]}   path     [description]
 * @param  {[type]}   mode     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function _mkdir(path, mode, callback) {
  if (callback === undefined) {
    callback = mode;
    mode = 0644;
  }
  if (!path) {
    return callback(true);
  }
  path = path.replace(/\\/g, '/').replace(/\/$/, '');
  if (path.indexOf('/') !== 0 && path.indexOf('.') !== 0) {
    path = './' + path;
  }
  var arr = [];
  _test(path, function (err, arr) {
    if (err) {
      callback(err);
    } else if (arr.length) {
      _mk(arr, arr.length - 1, callback);
    } else {
      callback();
    }
  });
  //check path
  function _test(path, cb) {
    Fs.stat(path, function (err, stat) {
      if (err) {
        if (err.code === 'ENOENT') {
          arr.push(path);
          path = path.replace(/\/[^\/]+$/, '');
          if (!path || path == '.' || path == '..') {
            return cb(null, arr);
          }
          _test(path, cb);
        } else {
          cb(err);
        }
      } else {
        cb(null, arr);
      }
    });
  }
  function _mk(arr, i, cb) {
    var p = arr[i];
    Fs.mkdir(p, mode, function (err) {
      if (err) {
        cb(err);
      } else {
        if (i === 0) return cb(null);
        i --;
        _mk(arr, i, cb);
      }
    });
  }
}
/**
 * [_mkdirSync description]
 * @param  {Path} path path
 * @param  {FileMod} mode
 * @return {Boolean}  true or false
 */
function _mkdirSync(path, mode) {
  mode = mode ? mode : 0644;
  var paths = [];
  var exist = _checkDirExistSync(path);
  while (!exist) {
    paths.push(path);
    path = Path.dirname(path);
    exist = _checkDirExistSync(path);
  }
  for (var n = paths.length - 1; n >= 0 ; n++) {
    Fs.mkdirSync(paths[n]);
  }
  return true;
}
function _checkDirExistSync(path) {
  var exist = Fs.existsSync(path);
  var stat;
  if (exist) {
    stat = Fs.statSync(path);
    if (stat.isDirectory()) {
      return true;
    } else {
      throw new Error(path + ' Not a directory');
    }
  }
  return false;
}

/**
 * ==========================================
 * [_rename description]
 * @param  {[type]}   src  [description]
 * @param  {[type]}   dest [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
function _rename(src, dest, cb) {
  Fs.rename(src, dest, function (err) {
    if (err) {
      // test if err is called by cross device rename
      if (err.code === "UNKNOW" || err.code === "ENOENT" || err.code === "EXDEV") {
        var _src, _dest;
        try {
          _src = Fs.createReadStream(src);
          _dest = Fs.createWriteStream(dest);
        } catch (e) {
          return cb(e);
        }
        _src.on('end', function () {
          Fs.unlink(src, function (err) {
            cb(err);
          });
        });
        _src.pipe(_dest);
      } else {
        cb(err);
      }
    } else {
      cb(null);
    }
  });
}

function _writeFileSync(dest, content, encode, cb){
  var sync = testSync(arguments);
  if (sync) {
    var destdir = path
  } else {
    
  }
}
function _writeFileSync

/**
 * [getFlatTree description]
 * @param  {[type]} root [description]
 * @return {object}      [description]
 */
function getFlatTree(root){
        
}

/**
 * exports
 */
exports.rmdir = _rmdir;
exports.mkdir = _mkdir;
exports.mkdirSync = _mkdirSync;
exports.rename = _rename;
exports.writeFile = _writeFile;
