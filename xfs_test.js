var expect = require('expect.js');
var xfs = require('./xfs');
var fs = require('fs');

describe('#mkdir,#rmdir',function(){
        it('xfs.mkdir', function(done){
            xfs.mkdir('test/a/b/c',function(){
                xfs.stat('test/a/b/c',function(err,stat){
                    expect(err).to.not.be.ok();
                    xfs.rmdir('test',function(err){
                        expect(err).to.not.be.ok();
                        done();
                    });
                });
            });
        });
});
describe("#rename",function(){
    it('xfs.rename',function(done){
            xfs.writeFileSync('/tmp/test.txt','hello');
            fs.rename('/tmp/test.txt','/home/fish/test.txt',function(err){
                expect(err).to.be.ok();
                xfs.rename('/tmp/test.txt','/home/fish/test.txt',function(err){
                    expect(err).to.not.be.ok();
                    done();
                });
            });
    });
});
