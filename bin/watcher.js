#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    chokidar = require('chokidar'),
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
                console.log('Info: webss setup succeed')
                console.log('Info: please modify your webss.json file in your project dir, then exec "webss deploy"')
            });
        }else if(arg === 'deploy'){
            deployWar.deploy(function(){
                console.log('Info: webss deploy succeed')
            })
        }else if(arg === 'server'){
            middlewareHandle(function(){
                synchFiles();
                transfer.transfer();
                wsServerObj = new wsServer();
            })
            shutdownTomcat(startupTomcat);
        }else if(arg === 'run'){
            console.log('Info: [webss run] has deprecated, integration with [webss server]')

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
    this.server.listen(config.wsServerPort, function() { });

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
var storeData = {};// 子进程之间共享数据
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
                        if(m.type === 'share'){
                            storeData = m.data
                        }
                    })
                    n.on('exit', function () {
                        if(isError){
                            resume(new Error(msg.join('')))
                        }else{
                            resume()
                        }

                    })
                    n.send({
                        type: "start",
                        data: storeData
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
        alwaysStat: true,

        usePolling: true,
        interval: 2000,
        //binaryInterval: 5000,
        //awaitWriteFinish: {
        //    stabilityThreshold: 5000,
        //    pollInterval: 5000
        //}
    }).on('all', function(event, filePath) {
        var filePathArray = filePath.split(util.isWin ? '\\' : '/'),
            fileName = filePathArray[filePathArray.length-1],
            distPath = filePath.replace(config.sourceDir, config.targetDir),
            distDictionary = filePath.replace(config.sourceDir, config.targetDir).replace(fileName, '');

        middlewareHandle(function(){}, filePath)

        if(event === 'unlink'){
            del([distPath]).then(function (paths) {
                console.log('Info: delete file -> :\n', distPath);
            });
        }else{
            fs.unlink(distPath, function(){
                //cpy([filePath], distDictionary, function (err) {
                try {
                    if (fs.lstatSync(filePath).isDirectory()) return
                } catch(ex){}
                util.copy(filePath, distDictionary, function(err){
                    console.log('Info: update file -> \n' + distPath);
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
    cp.exec(path.join(config.tomcatHome, '/bin/', shutdownTomcatExec), {cwd: path.join(config.tomcatHome, '/bin')}, function (err, stdout, stderr) {
        callback && callback();
    });
}
function startupTomcat(callback){
    console.log('start tomcat ...');
    fs.stat(path.join(config.tomcatHome, '/bin/', startTomcatExec), function(err){
        if(err){
            console.error('error: please re-exec "webss deploy"  !!!')
            console.log(err)
        }else{
            cp.exec(path.join(config.tomcatHome, '/bin/', startTomcatExec), {cwd: path.join(config.tomcatHome, '/bin')}, function (err, stdout, stderr) {
                callback && callback();
            });
        }
    })

}

