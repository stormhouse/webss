#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    chokidar = require('chokidar'),
    cpy = require('cpy'),
    del = require('del'),
    cp = require('child_process');

var util = require('./util.js'),
    config = require('./config.js'),
    downloadZip = require('./downloadZip.js'),
    deployWar = require('./deployWar.js'),
    transfer = require('./transfer.js');

var arg,
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
    if(error){
        console.log('please install Java SDK !!!')
    }else{
        if(arg === 'setup'){
            downloadZip.download(function(){
                console.log('info: webss setup succeed')
            });
        }else if(arg === 'deploy'){
            deployWar.deploy(function(){
                console.log('info: webss deploy succeed')
            })
        }else if(arg === 'server'){
            shutdownTomcat(startupTomcat);
        }else if(arg === 'run'){
            synchFiles();
            setTimeout(function(){
                console.log('\n\n')
                transfer.transfer();
            }, 5000)
        }else{
            util.showHelp();
        }
    }
});

function synchFiles(){
    chokidar.watch(config.sourceDir, {ignored:  /node_modules\\|\.idea|\.plugins|\.git|\.jar|\.xml|\.class/}).on('all', function(event, path) {
        var filePathArray = path.split('\\'),
            fileName = filePathArray[filePathArray.length-1],
            distPath = path.replace(config.sourceDir, config.targetDir),
            distDictionary = path.replace(config.sourceDir, config.targetDir).replace(fileName, '');
        if(event === 'unlink'){
            del([distPath]).then(function (paths) {
                console.log('info: delete file -> :\n', distPath);
            });
        }else{
            cpy([path], distDictionary, function (err) {
                console.log('info: update file -> \n' + distPath)
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

