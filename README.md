## webss
Tools for Front-End Developer to develop JavaWeb Project(Maven based)

## install
```
npm install -g webss
```

## webss.json
```
{
    "webPath": "/",
    "port": "8080",
    "proxies": [{
        "remoteUrl": "http://127.0.0.1:8888",
        "localPort": "5050",
        "desc": "local server"
    }]
}
```

## usage
```
$ webss help
Usage: webss [options]

Options:
  setup      download maven and tomcat
  deploy     mvn package project, deploy war to tomcat dir
  server     start tomcat server
  run        synch files of webproject to tomcat webapps dir, and start proxy
```

## Intro
- 自动化安装（Tomcat, Maven）部署项目，省去繁杂的环境配置工作
- 添加类似反向代理功能，指定服务器IP，方便与后台联调接口及连接于测试（线上）环境
- 在页面中注入JS脚本（WebSocket），实现文件发生变化时，页面自动刷新
- 抛离了对IDE的依赖，用自己喜欢的编辑器
