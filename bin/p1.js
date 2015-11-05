var cp = require('child_process');

cp.exec('java -version', function (err, stdout, stderr) {
    setTimeout(function(){
        process.send(111)
        process.exit()
    },2000)

})






