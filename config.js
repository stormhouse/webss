var fs = require('fs'),
    path = require('path'),
    util = require('./util.js');

var exports = module.exports = {};

var configStr = '{\n' +
    '    "contextName": "weixin",\n' +
    '    "webPath": "/",\n' +
    '    "port": "8888",\n' +
    '    "servers": [{\n' +
    '        "url": "http://127.0.0.1:8888/",\n' +
    '        "localPort": "5050",\n' +
    '        "desc": "local server"\n' +
    '    }]\n' +
    '}';
if(!fs.existsSync('./webss.json'))
    fs.writeFileSync('./webss.json', configStr);


var config = JSON.parse(fs.readFileSync('./webss.json'));
var currentPath = path.resolve('./');

exports.port = config.port;
exports.tomcatUrl = config.tomcatUrl || 'http://ftp.yz.yamagata-u.ac.jp/pub/network/apache/tomcat/tomcat-6/v6.0.44/bin/apache-tomcat-6.0.44.zip';
exports.mvnUrl = config.mvnUrl || 'http://ftp.jaist.ac.jp/pub/apache/maven/maven-3/3.3.3/binaries/apache-maven-3.3.3-bin.zip';
exports.tomcatName = config.tomcatName || 'apache-tomcat-6.0.44.zip';
exports.mvnName = config.mvnName || 'apache-maven-3.3.3-bin.zip';

exports.contextName = config.contextName;
exports.homePath = path.join(util.osHomePath, '/.node_mvn_javaweb/');
exports.sourceDir = path.join(path.join(currentPath, config.webPath), '/src/main/webapp');
exports.tomcatHome = path.join(exports.homePath, '/server/'+ exports.port);
exports.targetDir = path.join(exports.tomcatHome, '/webapps/' + exports.contextName);
exports.sourceWar = path.join(currentPath+config.webPath, '/target/' + exports.contextName + '.war');
exports.mvnHome = path.join(exports.homePath, '/maven');
exports.servers = config.servers;
exports.webPath = config.webPath;
exports.currentPath = path.resolve('./');
//exports.currentPath = path.resolve('./');
