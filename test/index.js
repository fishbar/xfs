var jsc = require('jscoverage');
require = jsc.mock(module);
var expect = require('expect.js');
require('../lib/async', true);
var xfs = require('../index', true);
var fs = require('fs');

process.on('exit', function () {
  jsc.coverage();
});

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
  it('should be ok when move file', function (done) {
    xfs.writeFileSync('/tmp/test.txt', 'hello');
    xfs.rename('/tmp/test.txt', './test.txt', function (err) {
      expect(err).to.be(null);
      xfs.stat('/tmp/test.txt', function (err) {
        expect(err.code).to.be('ENOENT');
        expect(xfs.readFileSync('./test.txt').toString()).to.be('hello');
        xfs.unlink('./test.txt', function () {
          done();
        });
      });
    });
  });
});