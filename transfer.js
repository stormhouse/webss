var http = require('http'),
    httpProxy = require('http-proxy'),
    path = require('path'),
    harmon = require('harmon'),
    connect = require('connect'),
    fs = require('fs');

var config = require('./config.js');

var proxy = httpProxy.createProxyServer({});

var exports = module.exports = {};
exports.transfer = function (){

    var selects = [];
    var simpleselect = {};

    simpleselect.query = 'head';
    simpleselect.func = function (node) {

        var out = '<style type="text/css"> img { ';
        out +='-webkit-transform: rotate(-120deg); ';
        out += '-moz-transform: rotate(-90deg); ';
        out += 'filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);}</style>';

        out += `
        <script>
            // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        var connection = new WebSocket('ws://127.0.0.1:1337');

        connection.onopen = function () {
            // connection is opened and ready to use
        };

        connection.onerror = function (error) {
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

    var app = connect();


    config.servers.forEach(function(objServer){
        //var server = http.createServer(function(req, res) {

            var proxy = httpProxy.createProxyServer({
                target: objServer.url
            })

            app.use(harmon([], selects, true));
            app.use(function (req, res) {
                var startIndex = req.url.indexOf('portal/');
                if( startIndex > -1){
                    var p = path.join(path.resolve('./') , config.webPath,  '/src/main/webapp/', req.url.substring(startIndex, req.url.length))
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


        console.log("listening on port "+ objServer.localPort + ' of ', objServer.desc + ' --> '+objServer.url);
        http.createServer(app).listen(objServer.localPort);
    })
}

if(require.main === module){
    exports.transfer()
}