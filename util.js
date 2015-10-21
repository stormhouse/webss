var exports = module.exports = {};

var log = console.log.bind(console);

exports.osHomePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
exports.isWin = process.platform == 'win32' ? true : false;
exports.showHelp = function(){
    log('\n')
    log('Usage: webss [options]');
    log('\n')
    log('Options: ')
    log('  setup      download maven and tomcat, and deploy')
    log('  deploy     mvn package project, deploy war to tomcat dir')
    log('  server     start tomcat server')
    log('  watch      synch files of webproject to tomcat webapps dir')
    log('\n\n\n')
};
