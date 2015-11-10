var cp = require('child_process');

cp.exec('webpack', function (err, stdout, stderr) {
    process.send({
        type: 'error',// info
        msg: 'webpak done: ' + stdout + stderr
    })
    process.exit()

})






