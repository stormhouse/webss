var http = require('http')

http.globalAgent.maxSockets = 5

for(var i= 0,len=100; i<len; i++) {
    http.get("http://cn.bing.com/", function (res) {
        console.log(new Date().getTime() + "=======Got response: " + res.statusCode);
    }).on('error', function (e) {
        console.log(new Date().getTime() + "-------Got error: " + e.message);
    });
}