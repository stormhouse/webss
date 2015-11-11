var http = require('http')
var minimatch = require('minimatch')
var path = require('path')
var fs = require('fs')

http.globalAgent.maxSockets = 5

//for(var i= 0,len=100; i<len; i++) {
//    http.get("http://cn.bing.com/", function (res) {
//        console.log(new Date().getTime() + "=======Got response: " + res.statusCode);
//    }).on('error', function (e) {
//        console.log(new Date().getTime() + "-------Got error: " + e.message);
//    });
//}
//
//
//console.log(minimatch('d:/98/sdf/sdf/dist/sdfjksdfj/j.txt', '**/dist/**'))
//
//console.log(path.resolve("./src/main/webapp/viewport/build/main.js" ))
//console.log(path.normalize("./src/main/webapp/viewport/build/main.js" ))

fs.readdir('./', function(err, files){
    if(err){

    }else{
        var warFile = files.filter(function(name){
            console.log(name)
            return name.match(/.*\.war$/)
        })
        if(warFile.length === 1){

        }
        console.log(a)
    }
})