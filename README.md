## webss
tools for Front-End Developer to develop JavaWeb Project(base on maven)

## webss.json
```
{
    "contextName": "weixin",
    "webPath": "/",
    "port": "8080",
    "servers": [{
        "url": "http://127.0.0.1:8888",
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