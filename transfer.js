var http = require('http'),
    httpProxy = require('http-proxy'),
    path = require('path'),
    fs = require('fs');

var config = require('./config.js');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//

var exports = module.exports = {};
exports.transfer = function (){
    config.servers.forEach(function(objServer){
        var server = http.createServer(function(req, res) {
            var startIndex = req.url.indexOf('portal/');
            if( startIndex > -1){
                res.writeHead(200, {'source': 'from webss' });
                console.log(req.url+'---------')
                var p = path.join(path.resolve('./') , config.webPath,  '/src/main/webapp/', req.url.substring(startIndex, req.url.length))
                //p = p.replace(/\?v=\d?[\.\-]\d?/, '');

                p = p.substring(0,p.indexOf('?v=') > -1 ? p.indexOf('?v=') : p.length)
                console.log(p)
                fs.readFile(p, function(error, data){
                    if(error){
                        console.log(p+'=========')
                        console.log(error)

                    }else{
                        res.write(data);
                        res.end();
                    }

                })

            }else {
                console.log(req.url)
                console.log(objServer.url)
                proxy.web(req, res, {target: objServer.url});
            }
        });

        console.log("listening on port "+ objServer.localPort + ' of ', objServer.desc)
        server.listen(objServer.localPort);
    })
}