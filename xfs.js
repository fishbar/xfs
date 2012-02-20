/**
 * fs enhance 
 */
var fs = require('fs');
var Path = require('path');
/**  public functions **/
for(var i in fs){
    if(fs.hasOwnProperty(i))
        exports[i] = fs[i];
}
/**
 * rmdir 递归删除目录，异步回调
 *         支持dir / file删除, 如果文件不存在，则默认删除成功
 * @param path    file path
 * @param callback
 */
exports.rmdir = _rmdir;
/**
 * mkdir 递归的创建目录，异步回调
 *         如果文件目录存在，则默认返回成功
 * @param path
 * @param callback
 */
exports.mkdir = _mkdir;
/**
 * rename 移动文件,异步回调，支持跨device移动
 * @param {path} src 
 * @param {path} dest 
 * @param {function} cb
 **/
exports.rename = _rename;
/** inner functions **/

// delete dir
function _rmdir(path,cb){
    var self = this;
    fs.readdir(path,function(e,files){
        if(e){
            if(e.code === 'ENOTDIR'){
                fs.unlink(path,cb);
            }else if(e.code === 'ENOENT'){
                cb();
            }else{
                cb(e);    
            }
            return;
        } 
        var len = files.length;
        if(len){
            var count = 0,tmp_path;
            for(var i=0 ; i < len; i++){
                tmp_path = Path.join(path,files[i]);
                _delFile(tmp_path,function(e){
                    if(e){
                        return cb(e);
                    }
                    count ++;
                    if(count == len){
                        //finish dir child delete , then delete dir itself
                        fs.rmdir(path,cb);
                    }
                });
            }
        }else{
            fs.rmdir(path,cb);
        }
    });
}
function _delFile(path,cb){
    fs.stat(path,function(e,st){
        if(e){
            return cb(e);
        }
        if(st.isDirectory()){
            _rmdir(path,cb);
        }else if(st.isFile()){
            try{
                fs.unlink(path,cb);
            }catch(e){
                cb(e,path);
            }
        }
    });
}

function _mkdir(path,mode,callback){
    if(callback == undefined){
        callback = mode;
        mode = 0755;
    }
    if(!path){
        return callback(true);
    }
    path = path.replace(/\\/g,'/').replace(/\/$/,'');
    if(path.indexOf('/') !== 0 && path.indexOf('.') !== 0){
        path = './'+path;
    }
    var arr = [];
    _test(path,function(err,arr){
        if(err){
            callback(err);
        }else if(arr.length){
            _mk(arr,arr.length-1,callback);
        }else{
            callback();
        }
    });
    //check path
    function _test(path,cb){
        fs.stat(path,function(err,stat){
            if(err){
                if(err.code == 'ENOENT'){
                    arr.push(path);
                    path = path.replace(/\/[^\/]+$/,'');
                    if(!path || path == '.' || path == '..'){
                        return cb(null,arr);
                    }
                    _test(path,cb);
                }else{
                    cb(err);
                }
            }else{
                cb(null,arr);
            }
        })
    }
    function _mk(arr,i,cb){
        var p = arr[i];
        fs.mkdir(p,mode,function(err){
            if(err)
                cb(err);
            else{
                if(i == 0) return cb(null);
                i -- ;
                _mk(arr,i,cb);
            }   
        });
    }
}

function _rename(src,dest,cb){
    fs.rename(src,dest,function(err){
        if(err){
            // test if err is called by cross device rename
            if(err.code == "UNKNOW" || err.code == "ENOENT" || err.code == "EXDEV"){
                try{
                    var _src = fs.createReadStream(src);
                    var _dest = fs.createWriteStream(dest);
                }catch(e){
                    return cb(e);
                }
                _src.on('end',function(){
                    fs.unlink(src,function(err){
                        cb(err);
                    });
                });
                _src.pipe(_dest);
            }else{
                cb(err);
            }
        }else{
            cb(null);
        }
    });
}
