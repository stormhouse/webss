var cp = require('child_process');

cp.exec('java -version', function (err, stdout, stderr) {
    setTimeout(function(){
        process.send(222)
        process.exit()
    },1000)

})






