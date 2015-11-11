var fs = require('fs'),
    path = require('path'),
    util = require('./util.js');

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

exports.contextName = 'ROOT';// 不依赖pom.xml 中的finalName了
exports.homePath = path.join(util.osHomePath, '/.node_mvn_javaweb/');
exports.sourceDir = path.join(currentPath, config.webPath, '/src/main/webapp');
exports.tomcatHome = path.join(exports.homePath, '/server/'+ exports.port);
exports.targetDir = path.join(exports.tomcatHome, '/webapps/' + exports.contextName);
exports.sourceWarDir = path.join(currentPath+config.webPath, '/target/');
exports.mvnHome = path.join(exports.homePath, '/maven');
exports.proxies = config.proxies;
exports.webPath = path.join(currentPath, config.webPath)
exports.currentPath = path.resolve('./');
exports.middleware = config.middleware || [];
