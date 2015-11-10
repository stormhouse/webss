#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    chokidar = require('chokidar'),
    cpy = require('cpy'),
    del = require('del'),
    cp = require('child_process'),
    WebSocketServer = require('websocket').server,
    http = require('http'),
    minimatch = require("minimatch");


var util = require('./../src/util.js'),
    config = require('./../src/config.js'),
    downloadZip = require('./../src/downloadZip.js'),
    deployWar = require('./../src/deployWar.js'),
    transfer = require('./../src/proxy.js');


var arg,
    wsServerObj,
    startTomcatExec = util.isWin ? 'startup.bat' : 'startup.sh',
    shutdownTomcatExec = util.isWin ? 'shutdown.bat' : 'shutdown.sh';

process.argv.forEach(function (val, index, array) {
    if(index == 2){
        arg = val;
    }
});
if (arg === 'help' || arg === '') {
    util.showHelp();
    return ;
}
if(!config.contextName) return ;

cp.exec('java -version', {cwd: config.currentPath}, function (error, stdout, stderr) {
    if(error || process.env['JAVA_HOME'] === undefined ){
        console.log('please install Java SDK, and set JAVA_HOME environment variable !!!')
    }else{
        if(arg === 'setup'){
            downloadZip.download(function(){
                console.log('info: webss setup succeed')
                console.log('info: please modify your webss.json file in your project dir, then exec "webss deploy"')
            });
        }else if(arg === 'deploy'){
            deployWar.deploy(function(){
                console.log('info: webss deploy succeed')
            })
        }else if(arg === 'server'){
            shutdownTomcat(startupTomcat);
        }else if(arg === 'run'){

            middlewareHandle(function(){
                synchFiles();
                transfer.transfer();
                wsServerObj = new wsServer();
            })

        }else{
            util.showHelp();
        }
    }
});

function wsServer(){
    this.server = http.createServer(function(request, response) {
        // process HTTP request. Since we're writing just WebSockets server
        // we don't have to implement anything.
    });
    this.server.listen(13377, function() { });

// create the server
    this.wsServer = new WebSocketServer({
        httpServer: this.server
    });

    this.connection = undefined;
    var self = this
// WebSocket server
    this.wsServer.on('request', function(request) {
        self.connection = request.accept(null, request.origin);

        // This is the most important callback for us, we'll handle
        // all messages from users here.
        self.connection.on('message', function(message) {
            if (message.type === 'utf8') {
                // process WebSocket message
            }
        });

        self.connection.on('close', function(connection) {
            // close user connection
        });

    });
    this.sendMessage = function(){
        if(self && self.connection && self.connection.sendUTF){
            self.connection.sendUTF('reload');
        }
    }
}

function middlewareHandle(callback, filePath){
    // 中间件
    if(config.middleware && config.middleware.length>0){
        var funs = [];

        config.middleware.map(function(obj){
            var isCallms = false;
            obj.scope = [].concat(obj.scope);
            isCallms = obj.scope.some(function(s){
                if(filePath === undefined) return true; // 程序启动时，首次执行
                return minimatch(filePath,  s);
            })

            if(isCallms) {

                funs.push(function (resume) {
                    console.log(path.resolve(obj.bin))
                    var n = cp.fork(path.resolve(obj.bin), filePath === undefined ? [] : ["-f", filePath], {
                        "cwd": path.dirname(path.resolve(obj.bin))
                    })

                    var isError = false
                    var msg = []
                    n.on('message', function (m) {
                        isError = m.type === 'error'
                    })
                    n.on('exit', function () {
                        if(isError){
                            resume(new Error(msg.join('')))
                        }else{
                            resume()
                        }

                    })
                })
            }
        })

        util.run(function * G(resume){
            for(var i= 0,len=funs.length; i<len; i++){
                yield funs[i](resume)
            }
            callback && callback()
        })
    }else{
        callback && callback()
    }
}

function synchFiles(){
    chokidar.watch(config.sourceDir, {
        ignored:  /node_modules\\|\.idea|\.plugins|\.git|\.jar|\.xml|\.class/,
        ignoreInitial: true,
        alwaysStat: true
    }).on('all', function(event, filePath) {
        var filePathArray = filePath.split('\\'),
            fileName = filePathArray[filePathArray.length-1],
            distPath = filePath.replace(config.sourceDir, config.targetDir),
            distDictionary = filePath.replace(config.sourceDir, config.targetDir).replace(fileName, '');

        middlewareHandle(function(){}, filePath)

        if(event === 'unlink'){
            del([distPath]).then(function (paths) {
                console.log('info: delete file -> :\n', distPath);
            });
        }else{
            fs.unlink(distPath, function(){
                cpy([filePath], distDictionary, function (err) {
                    console.log(222)
                    console.log('info: update file -> \n' + distPath);
                    if(config.pageAutoReload){
                        wsServerObj.sendMessage();
                    }
                });
            });
        }
    });
}

function shutdownTomcat(callback){
    console.log('shutdown tomcat ...');
    cp.exec(shutdownTomcatExec, {cwd: path.join(config.tomcatHome, '/bin')}, function (err, stdout, stderr) {
        callback && callback();
    });
}
function startupTomcat(callback){
    console.log('start tomcat ...');
    cp.exec(startTomcatExec, {cwd: path.join(config.tomcatHome, '/bin')}, function (err, stdout, stderr) {
        callback && callback();
    });
}

