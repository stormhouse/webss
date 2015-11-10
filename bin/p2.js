var cp = require('child_process');

cp.exec('java -version', function (err, stdout, stderr) {
    process.send({
        type: 'error',// info
        msg: 'webpak done: ' + stdout + stderr
    })
    process.exit()

})




