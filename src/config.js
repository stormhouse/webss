var fs = require('fs'),
    path = require('path'),
    util = require('./util.js'),
    xml2js = require('xml2js');

var exports = module.exports = {};

var configStr = '{\n' +
    '    "webPath": "/",\n' +
    '    "port": "8888",\n' +
    '    "pageAutoReload": true,\n' +
    '    "proxies": [{\n' +
    '        "remoteUrl": "http://127.0.0.1:8888/",\n' +
    '        "localPort": "5050",\n' +
    '        "desc": "local server"\n' +
    '    }],\n' +
    '    "middleware": [{\n'+
    '        "scope": "**/src/**", \n'+
    '        "bin": "./src/main/webapp/viewport/build/main.js" \n'+
    '    }]\n'+
    '}';
if(!fs.existsSync('./webss.json'))
    fs.writeFileSync('./webss.json', configStr);


var config = JSON.parse(fs.readFileSync('./webss.json'));
var currentPath = path.resolve('./');


//查找pom.xml finalName属性
var pomFile = path.join(currentPath, config.webPath, '/pom.xml');
if(fs.existsSync(pomFile)){
    var pomContent = fs.readFileSync(pomFile);
    xml2js.parseString(pomContent, function (err, result) {
        if(err){
            console.log('error: ' + pomFile + ' is incorrect!!!')
        }else{
            if(result.project && result.project.build && result.project.build.length>0){
                if(result.project.build[0].finalName){
                    config.contextName = result.project.build[0].finalName[0]
                }else{
                    console.log('error: please set finalName node in ' + pomFile + '!!!')
                    return
                }
            }else{
                console.log('error: please set finalName node in ' + pomFile + '!!!')
                return
            }
        }
    });

}else{
    console.error('error: not found pom.xml file in webPath');
    return ;
}

var tomcatSource = {
    '6': {
        name: 'apache-tomcat-6.0.44.zip',
        url: 'http://ftp.yz.yamagata-u.ac.jp/pub/network/apache/tomcat/tomcat-6/v6.0.44/bin/apache-tomcat-6.0.44.zip',
        md5: '409e93f383ec476cde4c9b87f2427dbf'
    }
}
var mvnSource = {
    '3': {
        name: 'apache-maven-3.3.3-bin.zip',
        url: 'http://ftp.jaist.ac.jp/pub/apache/maven/maven-3/3.3.3/binaries/apache-maven-3.3.3-bin.zip',
        md5: '6e5da03a3324f616493a0fd09d6383fc'
    }
}
exports.port = config.port;
exports.pageAutoReload = config.pageAutoReload === false ? false : true;

exports.tomcatUrl = config.tomcatUrl || tomcatSource['6'].url;
exports.tomcatName = config.tomcatName || tomcatSource['6'].name;
exports.tomcatMd5 = config.tomcatMd5 || tomcatSource['6'].md5;

exports.mvnUrl = config.mvnUrl || mvnSource[3].url;
exports.mvnName = config.mvnName || mvnSource[3].name;
exports.mvnMd5 = config.mvnMd5 || mvnSource[3].md5;

exports.contextName = config.contextName;
exports.homePath = path.join(util.osHomePath, '/.node_mvn_javaweb/');
exports.sourceDir = path.join(currentPath, config.webPath, '/src/main/webapp');
exports.tomcatHome = path.join(exports.homePath, '/server/'+ exports.port);
exports.targetDir = path.join(exports.tomcatHome, '/webapps/' + exports.contextName);
exports.sourceWar = path.join(currentPath+config.webPath, '/target/' + exports.contextName + '.war');
exports.mvnHome = path.join(exports.homePath, '/maven');
exports.proxies = config.proxies;
exports.webPath = path.join(currentPath, config.webPath)
exports.currentPath = path.resolve('./');
exports.middleware = config.middleware || [];
//exports.currentPath = path.resolve('./');