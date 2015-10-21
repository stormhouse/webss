var http = require('http'),
    httpProxy = require('http-proxy'),
    path = require('path'),
    fs = require('fs');

var config = require('./config.js');

var proxy = httpProxy.createProxyServer({});

var exports = module.exports = {};
exports.transfer = function (){
    config.servers.forEach(function(objServer){
        var server = http.createServer(function(req, res) {
            var startIndex = req.url.indexOf('portal/');
            if( startIndex > -1){
                var p = path.join(path.resolve('./') , config.webPath,  '/src/main/webapp/', req.url.substring(startIndex, req.url.length))
                //p = p.replace(/\?v=\d?[\.\-]\d?/, '');
                p = p.substring(0,p.indexOf('?v=') > -1 ? p.indexOf('?v=') : p.length)
                fs.readFile(p, function(error, data){

                    if(error){
                        console.log(error)
                        res.writeHead(404, {'source': 'from webss' });
                        res.write('404 not found ');
                        res.end();
                    }else{
                        res.writeHead(200, {'source': 'from webss' });
                        res.write(data);
                        res.end();
                    }

                })

            }else {
                proxy.web(req, res, {target: objServer.url});
            }
        });

        console.log("listening on port "+ objServer.localPort + ' of ', objServer.desc)
        server.listen(objServer.localPort);
    })
}