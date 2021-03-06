var path = require('path'),
    fs = require('fs'),
    Decompress = require('decompress'),
    util = require('./util.js'),
    cp = require('child_process'),
    del = require('del'),

    config = require('./config.js');

if(config.contextName == undefined) return ;

var exports = module.exports = {};

var packageExec = path.join(config.mvnHome, '/bin/mvn'),
    startTomcatExec = util.isWin ? 'startup.bat' : 'startup.sh',
    shutdownTomcatExec = util.isWin ? 'shutdown.bat' : 'shutdown.sh';

function deleteFolderRecursive(path) {
    console.log(path.replace(/\\/g, '/')+'/**')
    del.sync([path.replace(/\\/g, '/')+'/**'], { force: true })
}

function updateTomcatPort(){
    var serverConfig = fs.readFileSync(path.join(config.tomcatHome, '/conf/server.xml')).toString();
    var httpPort = config.port;
    var ajpPort = 8009 + (parseInt(config.port)-8080);
    var shutdownPort = 8005 + (parseInt(config.port)-8080);

    serverConfig = serverConfig.replace('port="8080"', 'port="'+httpPort+'" URIEncoding="UTF-8"' );
    serverConfig = serverConfig.replace('port="8009"', 'port="'+ajpPort+'"' );
    serverConfig = serverConfig.replace('port="8005"', 'port="'+shutdownPort+'"' );
    fs.writeFileSync(path.join(config.tomcatHome, '/conf/server.xml'), serverConfig);
}

function shutdownTomcat(callback){
    console.log('Info: shutdown tomcat ...');
    cp.exec(shutdownTomcatExec, {cwd: path.join(config.tomcatHome, '/bin')}, function (err, stdout, stderr) {
        callback && callback();
    });
}

function execMaven(mvnExec, arg, callback){
    console.log('Info: mvn '+ arg +' ...')

    var args = []
    if (util.isWin) {
        args.unshift(mvnExec);
        args.unshift('/c'),
            args.unshift('/s');
        args.push(arg);
        args.push('-Dmaven.test.skip=true');
        mvnExec = process.env.COMSPEC || 'cmd.exe';
    } else {
        args.push(arg)
    }

    var mvnPackage    = cp.spawn(mvnExec, args, { cwd:  config.currentPath, env: process.env });

    mvnPackage.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    mvnPackage.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    mvnPackage.on('exit', function (code) {
        if(arg[0] === 'clean'){
            callback && callback()
            return
        }
        var  sourceWar ;
        fs.readdir(config.sourceWarDir, function(err, files){
            if(err){
                console.error('error: .war is not found!!!');
            }else{
                var warFile = files.filter(function(name){
                    return name.match(/.*\.war$/)
                })
                if(warFile.length === 1){
                    sourceWar = warFile[0];
                    //cpy([path.join(config.sourceWarDir, sourceWar)], path.join(config.tomcatHome, '/webapps'), function (err) {
                    // 去掉url上的contextName http://stackoverflow.com/questions/715506/tomcat-6-how-to-change-the-root-application
                    util.copy(path.join(config.sourceWarDir, sourceWar), path.join(config.tomcatHome, '/webapps'), {basename: 'ROOT.war'}, function (err) {
                        console.log('Info: deploy : \n' + sourceWar + ' succeed ')
                        console.log('    ' + path.join(config.tomcatHome, '/webapps'))
                        callback && callback();
                    });
                }else{
                    console.error('error: .war is not found!!!');
                }
            }
        })





    });
}

exports.deploy = function(callback) {
    if (!fs.existsSync(config.homePath + '/' + config.tomcatName) || !fs.existsSync(config.homePath + '/' + config.mvnName)) {
        console.log('Error: please exec webss setup first !!!');
        callback && callback('error');
        return ;
    }
    console.log('Info: svn update ...');

    cp.exec('svn update', {cwd: config.currentPath}, function (err, stdout, stderr) {

        console.log(stdout);
        //log('deploy ' + config.contextName + '.war to ' + 'server/ '+port);

        //if (fs.existsSync(removeContextPath + '.war')) {
        //    fs.unlinkSync(removeContextPath + '.war');
        //}
        // TODO
        shutdownTomcat(function () {

            //删除tomcat解压目录
            deleteFolderRecursive(config.tomcatHome)
            console.log('Info: decompress ' + config.tomcatName + ' ...');
            new Decompress({mode: '777'})
                .src(path.join(config.homePath, config.tomcatName))
                .dest(config.tomcatHome)
                .use(Decompress.zip({strip: 1}))
                .run(function (error) {
                    fs.readdirSync(path.join(config.tomcatHome, '/bin')).map(function(file){
                        fs.chmodSync(path.join(config.tomcatHome, '/bin/', file), '777')
                        //console.log(arguments)
                    })
                    //fs.chmodSync(config.tomcatHome, '+x');
                    var removeContextPath = path.join(config.tomcatHome, '/webapps/');
                    deleteFolderRecursive(removeContextPath);
                    if (error) {
                        console.error('error: decompress ' + config.tomcatName + ' failed !!!')
                    } else {
                        console.log('Info: decompress ' + config.tomcatName + ' succeed')

                        updateTomcatPort();

                        execMaven(packageExec, ['clean'], function () {
                            execMaven(packageExec, ['package'], function () {
                                callback && callback()
                            })
                        })

                    }
                })
        })
    });

}

if(require.main === module){
    exports.deploy()
}