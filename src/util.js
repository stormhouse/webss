var path = require('path'),
  fs = require('fs')


var log = console.log.bind(console)
var util = {
  osHomePath: process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'],
  isWin: process.platform == 'win32' ? true : false,
  showHelp: function(){
    log('\n')
    log('Usage: webss [options]')
    log('\n')
    log('Options: ')
    log('  setup      download maven and tomcat')
    log('  deploy     mvn package project, deploy war to tomcat dir')
    log('  server     start tomcat server')
    log('  run        synch files of webproject to tomcat webapps dir, and start proxy')
    log('\n\n\n')
    },
  run: function(generateFun){
    var g = generateFun(resume)
    g.next()
    function resume(value){
      if(value){
        console.error(value)
        return
        }
        g.next()
      }
    },
  /**
   *
   * @param src
   * @param dest
   * @param opts { overwrite, basename }
   * @param cb
   */
  copy: function(src, dest, opts, cb){
    var basename, read, write
    if(typeof opts === 'function') {
      cb = opts
      opts = {}
    }
    opts = Object.assign({
      overwrite: true,
      basename: ''
    }, opts)

    try {
      fs.accessSync(dest, fs.F_OK)
    } catch (e) {
      fs.mkdirSync(dest)
    }
    basename = opts.basename !== '' ? opts.basename : path.basename(src)

    dest = path.join(dest, basename)

    read = fs.createReadStream(src)
    read.on('error', function (err) {})
    read.on('data', function (data) {})
    read.on('end', function () {})

    write = fs.createWriteStream(dest, {flags: opts.overwrite ? 'w' : 'wx'})
    write.on('error', function (err) {
      cb && cb(err)
    })
    write.on('close', function () {
      cb && cb()
    })

    read.pipe(write)
    }
}
module.exports = util