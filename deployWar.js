var path = require('path'),
    fs = require('fs'),
    Decompress = require('decompress'),
    util = require('./util.js'),
    cp = require('child_process'),
    cpy = require('cpy'),

    config = require('./config.js');

var exports = module.exports = {};

var packageExec = path.join(config.mvnHome, '/bin/mvn package'),
    startTomcatExec = util.isWin ? 'startup.bat' : 'startup.sh',
    shutdownTomcatExec = util.isWin ? 'shutdown.bat' : 'shutdown.sh';

function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function updateTomcatPort(){
    var serverConfig = fs.readFileSync(path.join(config.tomcatHome, '/conf/server.xml')).toString();
    var httpPort = config.port;
    var ajpPort = 8009 + (parseInt(config.port)-8080);

    serverConfig = serverConfig.replace('port="8080"', 'port="'+httpPort+'"' );
    serverConfig = serverConfig.replace('port="8009"', 'port="'+ajpPort+'"' );
    fs.writeFileSync(path.join(config.tomcatHome, '/conf/server.xml'), serverConfig);
}

function shutdownTomcat(callback){
    console.log('info: shutdown tomcat ...');
    cp.exec(shutdownTomcatExec, {cwd: path.join(config.tomcatHome, '/bin')}, function (err, stdout, stderr) {
        callback && callback();
    });
}
exports.deploy = function(callback) {
    if (!fs.existsSync(config.homePath + '/' + config.tomcatName) || !fs.existsSync(config.homePath + '/' + config.mvnName)) {
        console.log('error: please exec webss setup first !!!');
        callback && callback('error');
        return ;
    }
    cp.exec('svn update', {cwd: config.currentPath}, function (err, stdout, stderr) {

        console.log(stdout);
        //log('deploy ' + config.contextName + '.war to ' + 'server/ '+port);
        var removeContextPath = path.join(config.tomcatHome, '/webapps/' + config.contextName);
        deleteFolderRecursive(removeContextPath);
        if (fs.existsSync(removeContextPath + '.war')) {
            fs.unlinkSync(removeContextPath + '.war');
        }
        // TODO
        console.log('info: decompress ' + config.tomcatName + ' ...');
        console.log(path.join(config.homePath, config.tomcatName))
        new Decompress({mode: '755'})
            .src(path.join(config.homePath, config.tomcatName))
            .dest(config.tomcatHome)
            .use(Decompress.zip({strip: 1}))
            .run(function (error) {
                if (error) {
                    //console.error('error: decompress ' + config.tomcatName + ' failed !!!')
                } else {
                    console.log('info: decompress ' + config.tomcatName + ' succeed')

                    updateTomcatPort();
                    shutdownTomcat(function () {
                        console.log('info: mvn package ...')
                        cp.exec(packageExec, {cwd: config.currentPath}, function (err, stdout, stderr) {
                            if (err) {
                                console.error('error: exec ' + packageExec + ' failed!!!')
                                callback && callback();
                            } else {
                                if (stdout.indexOf('BUILD SUCCESS') > -1) {
                                    console.log(stdout);
                                    if(!fs.existsSync(config.sourceWar)){
                                        console.error('error: ' + config.sourceWar + ' is not found!!!  please check "contextName && webPath" in webss.json');
                                        return
                                    }
                                    cpy([config.sourceWar], path.join(config.tomcatHome, '/webapps'), function (err) {
                                        console.log('info: deploy : \n' + config.sourceWar + ' succeed ')
                                        console.log('    ' + path.join(config.tomcatHome, '/webapps'))
                                        callback && callback();
                                    });
                                } else {
                                    console.error('error: deploy : \n' + config.sourceWar + ' failed!!!')
                                    callback && callback();
                                }
                            }
                        });
                    })
                }
            })
    });

}