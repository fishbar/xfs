xfs
======

xfs is a module extends builded-in fs module, let file manipulate easily

[![Build Status](https://secure.travis-ci.org/fishbar/xfs.png)](http://travis-ci.org/fishbar/xfs)


xfs extends the following functions :

## async functions
  * mkdir(path,cb) make directories and their contents recursively
  * rmdir(path,cb) remove directories and their contents recursively
  * rename(src,dest,cb) rename file across two different devices


## sync functions

  * rm(path)
  * mkdir(path)
  * save(path, data[, options|encoding])
  
```js
var sync = xfs.sync();
// shell > rm -r path
sync.rm(path);
// shell > mkdir -p path
sync.mkdir(path);
// save file auto create dir if not exist
// node >= v0.10.0
sync.save(path, data, option); // when node >= v0.10.0, the last param is option
sync.save(path, data, encoding); // when node < v0.10.0, the last param is encoding

```
  ... to be contine

## License

  MIT
