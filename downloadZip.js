var path = require('path'),
    fs = require('fs'),
    Download = require('download'),
    Decompress = require('decompress'),
    config = require('./config.js');

var exports = module.exports = {};

function downloadFile(url, destPath, fileName, callback){

    if(fs.existsSync(path.join(destPath, fileName))){
        console.log('info:  ' +fileName+ ' is exits ');
        setTimeout(function(){
            callback();
        },1)
    }else{
        console.log('info: download ' +fileName+ ' ...');
        new Download({mode: '755'})
            .get(url)
            .dest(destPath)
            .run(function (error, files) {
                if (error) {
                    console.error('error: download '+ fileName +' failed !!!');
                    callback && callback(new Error('error: download '+ fileName + ' failed!!!'));
                } else {
                    console.log('info: download ' +fileName+ ' succeed');
                    callback && callback();
                }
            });
    }

}
function decompressMaven(callback){
    console.log('info: decompress ' + config.mvnName + ' ...')
    new Decompress({mode: '755'})
        .src(path.join(config.homePath, config.mvnName))
        .dest(config.mvnHome)
        .use(Decompress.zip({strip: 1}))
        .run(function (error) {
            if (error) {
            	console.log(error)
                console.error('error: decompress ' + config.mvnName + ' failed!!!')
                callback && callback(new Error('error: decompress ' + config.mvnName + ' failed!!!'));
            } else {
                console.log('info: decompress ' + config.mvnName + ' succeed')
                callback && callback();
            }
        });
}


exports.download = function(callback){

    function run(generateFun){
        var g = generateFun(resume);
        g.next();
        function resume(value){
            if(value){
                return ;
            }
            g.next();
        }
    }

    run(function * G(resume){
        yield downloadFile(config.tomcatUrl, config.homePath, config.tomcatName, resume);
        yield downloadFile(config.mvnUrl, config.homePath, config.mvnName, resume);
        yield decompressMaven(resume);
        callback();
    });


    //if(!fs.existsSync('./webss.json')){
    //    console.error('error: webss.json file not found!!!')
    //    return ;
    //}
    //
    //if(fs.existsSync(path.join(config.homePath, config.tomcatName))){
    //    console.log('info: '+ config.tomcatName + ' is exists');
    //    if(fs.existsSync(path.join(config.homePath, config.mvnName))) {
    //        console.log('info: '+ config.mvnName + ' is exists');
    //    }else{
    //        downloadFile(config.mvnUrl, config.homePath, config.mvnName, function(){
    //            decompressMaven(function(){
    //                callback && callback();
    //            })
    //        })
    //    }
    //}else{
    //    downloadFile(config.tomcatUrl, config.homePath, config.tomcatName, function(){
    //        if(fs.existsSync(path.join(config.homePath, config.mvnName))) {
    //            console.log('info: '+ config.mvnName + ' is exists');
    //        }else{
    //            downloadFile(config.mvnUrl, config.homePath, config.mvnName, function(){
    //                decompressMaven(function(){
    //                    callback && callback();
    //                })
    //            })
    //        }
    //    });
    //}
}