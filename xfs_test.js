var expect = require('expect.js');
var xfs = require('./index');
var fs = require('fs');

describe('#mkdir,#rmdir', function () {
  it('xfs.mkdir', function (done) {
    xfs.mkdir('test/a/b/c', function () {
      xfs.stat('test/a/b/c', function (err) {
        expect(err).to.not.be.ok();
        xfs.rmdir('test', function (err) {
          expect(err).to.not.be.ok();
          done();
        });
      });
    });
  });
});

describe("#rename", function () {
  it('xfs.rename', function (done) {
    xfs.writeFileSync('/tmp/test.txt', 'hello');
    fs.rename('/tmp/test.txt', './test.txt', function (err) {
      expect(err).to.be.ok();
      xfs.rename('/tmp/test.txt', './test.txt', function (err) {
        expect(err).to.not.be.ok();
        xfs.unlink('./test.txt', function () {
          done();
        });
      });
    });
  });
});

describe("#writeFile", function () {
  it('xfs.writeFile', function (done) {
    xfs.writeFile('/tmp/a/b/c/test.txt', 'hello', function (err) {
      expect(err).to.be(null);
      var data = xfs.readFileSync('/tmp/a/b/c/test.txt');
      expect(data.toString()).to.be('hello');
      done();
    });
  });
});
