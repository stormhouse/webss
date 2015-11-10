var http = require('http'),
    httpProxy = require('http-proxy'),
    path = require('path'),
    harmon = require('harmon'),
    connect = require('connect'),
    fs = require('fs');

// TODO socket hang up error
// from https://nqdeng.github.io/7-days-nodejs/
// from http://stackoverflow.com/questions/16472497/nodejs-max-socket-pooling-settings
// from https://engineering.linkedin.com/nodejs/blazing-fast-nodejs-10-performance-tips-linkedin-mobile
http.globalAgent.maxSockets = 30;
var config = require('./config.js');

//var proxy = httpProxy.createProxyServer({});

var exports = module.exports = {};
exports.transfer = function (){

    var selects = [];
    var simpleselect = {};

    simpleselect.query = 'head';
    simpleselect.func = function (node) {

        var out = '';

        out += `
        <script>
            // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        var connection = new WebSocket('ws://127.0.0.1:13377');

        connection.onopen = function () {
            console.log('ws opened')
            // connection is opened and ready to use
        };

        connection.onerror = function (error) {
            console.log('ws error')
            // an error occurred when sending/receiving data
        };
        connection.onclose = function (error) {
            console.log('ws closed')
            // an error occurred when sending/receiving data
        };

        connection.onmessage = function (message) {
            if(message && message.data === 'reload')
                location.reload()
        }
        </script>
        `;

        var rs = node.createReadStream();
        var ws = node.createWriteStream({outer: false});

        // Read the node and put it back into our write stream,
        // but don't end the write stream when the readStream is closed.
        rs.pipe(ws, {end: false});

        // When the read stream has ended, attach our style to the end
        rs.on('end', function(){
            ws.end(out);
        });
    }

    selects.push(simpleselect);

    config.proxies.forEach(function(objServer){
        var app = connect();
            var proxy = httpProxy.createProxyServer({
                target: objServer.remoteUrl
            })

            app.use(harmon([], selects, true));
            app.use(function (req, res) {
                var startIndex = req.url.indexOf('portal/');
                if( startIndex > -1){
                    var p = path.join(config.webPath,  '/src/main/webapp/', req.url.substring(startIndex, req.url.length))
                    p = p.replace(/\?v=[\d|\.|\w|&|=|-]*/, ''); // 去掉后面的参数 manage.js?v=1.2-6&_=123
                    fs.readFile(p, function(error, data){

                        if(error){
                            console.error('error: file '+ p + ' not found');
                            res.writeHead(404, {'source': 'from webss' });
                            res.write('404 not found ');
                            res.end();
                        }else{
                            res.writeHead(200, {'source': 'from webss'});
                            res.write(data);
                            res.end();
                        }

                    })

                }else {
                    proxy.web(req, res);
                }
            })


        console.log("listening on port "+ objServer.localPort + ' of ', objServer.desc + ' --> '+objServer.remoteUrl);
        http.createServer(app).listen(objServer.localPort);
    })
}

if(require.main === module){
    exports.transfer()
}