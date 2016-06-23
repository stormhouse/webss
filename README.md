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