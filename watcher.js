#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    chokidar = require('chokidar'),
    cpy = require('cpy'),
    del = require('del'),
    cp = require('child_process'),
    WebSocketServer = require('websocket').server,
    http = require('http');

var util = require('./util.js'),
    config = require('./config.js'),
    downloadZip = require('./downloadZip.js'),
    deployWar = require('./deployWar.js'),
    transfer = require('./transfer.js');

var arg,
    isLog = false,
    wsServerObj,
    startTomcatExec = util.isWin ? 'startup.bat' : 'startup.sh',
    shutdownTomcatExec = util.isWin ? 'shutdown.bat' : 'shutdown.sh';

process.argv.forEach(function (val, index, array) {
    if(index == 2){
        arg = val;
    }
});
if (arg === 'help') {
    util.showHelp();
    return ;
}



//if (!fs.existsSync('./webss.json')) {
//    console.error('error: webss.json file not found!');
//    return
//}



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
            setTimeout(function(){
                isLog = true;
            }, 20000)
            synchFiles();
            transfer.transfer();
            wsServerObj = new wsServer();
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

function synchFiles(){
    chokidar.watch(config.sourceDir, {ignored:  /node_modules\\|\.idea|\.plugins|\.git|\.jar|\.xml|\.class/}).on('all', function(event, path) {
        var filePathArray = path.split('\\'),
            fileName = filePathArray[filePathArray.length-1],
            distPath = path.replace(config.sourceDir, config.targetDir),
            distDictionary = path.replace(config.sourceDir, config.targetDir).replace(fileName, '');
        if(event === 'unlink'){
            del([distPath]).then(function (paths) {
                isLog && console.log('info: delete file -> :\n', distPath);
            });
        }else{
            cpy([path], distDictionary, function (err) {
                isLog && console.log('info: update file -> \n' + distPath);
                if(isLog && config.autoReload){
                    wsServerObj.sendMessage();
                }
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

