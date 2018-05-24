/*!
 * xfs: test/index.js
 * Authors  : 枫弦 <fengxian.yzg@alibaba-inc.com> (https://github.com/yuzhigang33)
 * Create   : 2015-11-07 08:16:49
 * CopyRight 2015 (c) Alibaba Group
 */

var expect = require('expect.js');
var path = require('path');
require('../lib/async', true);
require('../lib/sync', true);
var xfs = require('../index', true);
var fs = require('fs');

process.chdir(__dirname);

describe('xfs.mkdir', function () {
  it('should be ok when dir not exit', function (done) {
    xfs.mkdir('tdir/a/b', function () {
      xfs.stat('tdir/a/b', function (err) {
        expect(err).to.not.be.ok();
        done();
      });
    });
  });
  it('should be ok when part of the path is exist', function (done) {
    xfs.mkdir('tdir/a/c', function () {
      xfs.stat('tdir/a/c', function (err) {
        expect(err).to.not.be.ok();
        done();
      });
    });
  });
  it('should be ok when path already exist', function (done) {
    xfs.mkdir('tdir/a/c', function () {
      xfs.stat('tdir/a/c', function (err) {
        expect(err).to.not.be.ok();
        done();
      });
    });
  });
  it('should be failed when path EACCES', function (done) {
    if (process.platform.indexOf('win') === 0) {
      // ignore windows platform
      return done();
    }
    fs.mkdir('tdir/eaccess', 0644, function () {
      xfs.mkdir('tdir/eaccess/a', function (err) {
        expect(err.code).to.be('EACCES');
        done();
      });
    });
  });
});

describe('xfs.rmdir()', function () {
  it('should be ok when rm an empty dir', function (done) {
    xfs.rmdir('tdir/a/b', function (err) {
      expect(err).to.be(null);
      done();
    });
  });
  it('should be ok when rm an dir with an dir', function (done) {
    xfs.mkdir('tdir/a/b/c/d', function () {
      xfs.rmdir('tdir/a', function (err) {
        expect(err).to.be(null);
        done();
      });
    });
  });
  it('should be ok when rm an dir with dir and file', function (done) {
    xfs.writeFile('tdir/a/b/c/test.txt', 'asdf', function () {
      xfs.rmdir('tdir/a', function (err) {
        expect(err).to.be(null);
        done();
      });
    });
  });
  it('should be ok when rm an no exist path', function (done) {
    xfs.rmdir('tdir/d', function (err) {
      expect(err).to.be(null);
      done();
    });
  });
  it('should be ok when rm an dir with dir and file', function (done) {
    xfs.writeFile('tdir/a/b/c/test.txt', 'asdf', function () {
      xfs.rmdir('tdir/a/b/c/test.txt', function (err) {
        expect(err).to.be(null);
        fs.stat('tdir/a/b/c/test.txt', function (err, data) {
          expect(err.code).to.be('ENOENT');
          done();
        });
      });
    });
  });
});

describe("xfs.rename()", function () {
  beforeEach(function () {
    xfs.sync().rm('./walk');
  });
  it('should be ok when move file', function (done) {
    var tmpDir = process.env.TMP || process.env.TMPDIR || '/tmp';
    var fpath = path.join(tmpDir, 'test.txt');
    xfs.writeFileSync(fpath, 'hello');
    xfs.rename(fpath, './test.txt', function (err) {
      expect(err).to.be(null);
      xfs.stat(fpath, function (err) {
        expect(err.code).to.be('ENOENT');
        expect(xfs.readFileSync('./test.txt').toString()).to.be('hello');
        xfs.unlink('./test.txt', function () {
          done();
        });
      });
    });
  });
  it('should be ok when fs.rename error', function (done) {
    var tmpDir = process.env.TMP || process.env.TMPDIR || '/tmp';
    var fpath = path.join(tmpDir, 'test.txt');
    xfs.writeFileSync(fpath, 'hello');
    var orig_rename = fs.rename;
    fs.rename = function (a, b, cb) {
      var e = new Error('mock')
      e.code = 'EXDEV';
      cb(e);
    };
    xfs.rename(fpath, './test.txt', function (err) {
      expect(err).to.be(null);
      xfs.stat(fpath, function (err) {
        expect(err.code).to.be('ENOENT');
        expect(xfs.readFileSync('./test.txt').toString()).to.be('hello');
        xfs.unlink('./test.txt', function () {
          fs.rename = orig_rename;
          done();
        });
      });
    });
  });

  it('should ok when walk through dir', function (done) {
    xfs.sync().save('./walk/a.js', '');
    xfs.sync().save('./walk/b/c.js', '');
    xfs.sync().mkdir('./walk/a');
    var arr = [];
    xfs.walk('./walk', function (err, file, done) {
      arr.push(file);
      done();
    }, function () {
      expect(arr.length).to.be(2);
      expect(arr[0]).to.match(/a\.js/);
      expect(arr[1]).to.match(/c\.js/);
      done();
    });
  });

  it('should ok when walk through dir with filter', function (done) {
    xfs.sync().save('./walk/a.js', '');
    xfs.sync().save('./walk/b/c.js', '');
    xfs.sync().save('./walk/b/d.css', '');
    var arr = [];
    xfs.walk('./walk', /\.js/, function (err, file, done) {
      arr.push(file);
      done();
    }, function () {
      expect(arr.length).to.be(2);
      expect(arr[0]).to.match(/a\.js/);
      expect(arr[1]).to.match(/c\.js/);
      done();
    });
  });

  it('should ok when walk through when cb without done function', function (done) {
    var arr = [];
    xfs.sync().save('./walk/a.js', '');
    xfs.sync().save('./walk/b.js', '');
    xfs.walk('./walk', function (err, file) {
      arr.push(file);
    }, function () {
      expect(arr.length).to.be(2);
      expect(arr[0]).to.match(/a\.js/);
      done();
    });
  });

  it('should ok when walk through when on done function', function (done) {
    var arr = [];
    xfs.sync().save('./walk/a.js', '');
    xfs.walk('./walk', function (err, file) {
      arr.push(file);
    });
    setTimeout(function () {
      expect(arr.length).to.be(1);
      expect(arr[0]).to.match(/a\.js/);
      done();
    }, 50);
  });

  it('should ok when walk through when on done function', function (done) {
    var arr = [];
    xfs.walk('./walk', function (err, file) {

    }, done);
  });
});

describe('xfs.sync()', function () {
  before(function (done) {
    xfs.sync().rm('./tdir/sync');
    done();
  });
  describe('save', function () {
    it('should ok when save file to exists path', function () {
      xfs.sync().save('./tdir/sync/test.txt', 'abc');
      expect(xfs.readFileSync('./tdir/sync/test.txt').toString()).to.be('abc');
    });
    if (compareVersion(process.version, 'v0.10.0')) {
      it('should ok when save file with option to exist file', function () {
        xfs.sync().save('./tdir/sync/test.txt', 'def', {flag: 'a'});
        expect(xfs.readFileSync('./tdir/sync/test.txt').toString()).to.be('abcdef');
      });
    }
    it('should ok when save file to un-exists path', function () {
      xfs.sync().save('./tdir/sync/a/b/c/d.txt', 't');
      expect(xfs.readFileSync('./tdir/sync/a/b/c/d.txt').toString()).to.be('t');
    });
  });
  describe('mkdir', function () {
    it('should be ok when path not exist', function () {
      var path = './tdir/sync/test';
      xfs.sync().mkdir(path);
      var stat = xfs.statSync(path);
      expect(stat.isDirectory()).to.be(true);
    });
    it('should be ok when path already exists', function () {
      var path = './tdir/sync/test';
      xfs.sync().mkdir(path);
      var stat = xfs.statSync(path);
      expect(stat.isDirectory()).to.be(true);
    });
  });
  describe('rm', function () {
    it('should be ok when rm un-exists file', function () {
      xfs.sync().rm('./tdir/undefined/abc/');
    });
  });
});

function compareVersion(v0, v1) {
  v0 = v0.split('.');
  v1 = v1.split('.');
  if (v0[0] > v1[0]) {
    return true;
  } else if (v0[0] < v1[1]) {
    return false;
  }
  var tmp = parseInt(v0[1], 10) - parseInt(v1[1], 10);
  if (tmp > 0) {
    return true;
  } else if (tmp < 0){
    return false;
  }
  tmp = parseInt(v0[2], 10) - parseInt(v1[2], 10);
  if (tmp >= 0) {
    return true;
  } else {
    return false;
  }
}
