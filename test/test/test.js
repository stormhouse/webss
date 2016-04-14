var http = require('http')
var minimatch = require('minimatch')
var path = require('path')
var fs = require('fs')

var util = require('../src/util.js')
util.copy('./test.js', './test/')
//http.globalAgent.maxSockets = 5

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

