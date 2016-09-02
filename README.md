# HengHa
[![Build Status](https://travis-ci.org/hashmaparraylist/HengHa.svg?branch=v0.1.0%2Fmaster)](https://travis-ci.org/hashmaparraylist/HengHa) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![codecov](https://codecov.io/gh/hashmaparraylist/HengHa/branch/master/graph/badge.svg)](https://codecov.io/gh/hashmaparraylist/HengHa)

一个基于node.js的API Gateway

## 目录

* [安装](#安装)
* [启动](#启动)
* [配置](#配置)
* [管理端API](#管理端api)

## 安装

```shell
git clone https://github.com/hashmaparraylist/HengHa.git
cd ./HengHa
npm install
```

## 启动

```shell
node index.js -c config.json
```

### 参数

`-c filename`
指定配置文件，如不指定则使用默认配置文件

## 配置

在不指定配置文件的情况下，使用下述默认配置文件
```json
  // 数据文件存放位值
  "data": {
    "file": "./data/hengha.json"
  },

  // Gateway端配置
  "gateway": {
    "port": 1981,
    "logger": {
      "level": "debug" 
    }
  },

  // 管理端配置
  "admin": {
    "port": 2016,
    "authorization": {      
      "user": "admin",
      "password": "admin"
    },
    "logger": {
      "level": "debug"
    }
  }
```

## 管理端API

### `GET /api` 

获取所有登录的API

```
# Request
GET /api HTTP/1.1
Host: localhost:2016
User-Agent: curl/7.43.0
Accept: */*
Authorization:Basic YWRtaW46YWRtaW4=

# Response
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 469
Date: Fri, 02 Sep 2016 08:02:41 GMT
Connection: keep-alive

# Response Body
[  
   {  
      "location":"/demo1/",
      "proxy_pass":"http://localhost:7777/service/demo1-service/",
      "id":"9b0f6740-69d4-11e6-a2ca-976ed89ed127"
   },
   {  
      "location":"/demo2/",
      "proxy_pass":"http://localhost:7777/api/demo2-service/",
      "id":"a66e0470-69d4-11e6-a2ca-976ed89ed127"
   }
]
```

### `GET /api/:id`

获取指定id的api

```
# Request
GET /api/9b0f6740-69d4-11e6-a2ca-976ed89ed127 HTTP/1.1
Host: localhost:2016
User-Agent: curl/7.43.0
Accept: */*
Authorization:Basic YWRtaW46YWRtaW4=

# Response
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 123
Date: Fri, 02 Sep 2016 08:14:37 GMT
Connection: keep-alive

# Response Body
{  
    "location":"/demo1/",
    "proxy_pass":"http://localhost:7777/service/demo1-service/",
    "id":"9b0f6740-69d4-11e6-a2ca-976ed89ed127"
}
```

### `POST /api`

追加一个新的api

``` shell
# 使用示例
curl -v \
     -H Authorization:'Basic YWRtaW46YWRtaW4=' \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"locastion": "/dem9/", "proxy_pass": "http://localhost:7777/service/demo9/"}' \
     http://localhost:2016/api 
```

```
# Request
POST /api HTTP/1.1
Host: localhost:2016
User-Agent: curl/7.43.0
Accept: */*
Authorization:Basic YWRtaW46YWRtaW4=
Content-Type: application/json
Content-Length: 77

# Response
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 118
Date: Fri, 02 Sep 2016 08:30:35 GMT
Connection: keep-alive

# Response Body
{  
   "locastion":"/dem9/",
   "proxy_pass":"http://localhost:7777/service/demo9/",
   "id":"85581f40-70e7-11e6-85e3-674d3ab2db19"
}
```

### `PUT /api/:id`

更新一个已有的api

``` shell
# 使用示例
curl -v \
     -H Authorization:'Basic YWRtaW46YWRtaW4=' \
     -H "Content-Type: application/json" \
     -X PUT \
     -d '{"locastion": "/dem9/", "proxy_pass": "http://localhost:7777/api/demo9/"}' \
     http://localhost:2016/api/85581f40-70e7-11e6-85e3-674d3ab2db19
```

```
# Request
PUT /api/85581f40-70e7-11e6-85e3-674d3ab2db19 HTTP/1.1
Host: localhost:2016
User-Agent: curl/7.43.0
Accept: */*
Authorization:Basic YWRtaW46YWRtaW4=
Content-Type: application/json
Content-Length: 73

# Response
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 650
Date: Fri, 02 Sep 2016 08:48:39 GMT
Connection: keep-alive

# Response Body
[  
   {  
      "location":"/demo1/",
      "proxy_pass":"http://localhost:7777/service/demo1-service/",
      "id":"9b0f6740-69d4-11e6-a2ca-976ed89ed127"
   },
   {  
      "location":"/demo2/",
      "proxy_pass":"http://localhost:7777/api/demo2-service/",
      "id":"a66e0470-69d4-11e6-a2ca-976ed89ed127"
   },
      {  
      "locastion":"/dem9/",
      "proxy_pass":"http://localhost:7777/api/demo9/",
      "id":"85581f40-70e7-11e6-85e3-674d3ab2db19"
   }
]
```

### `DELETE /api:id`

删除一个已有的api

``` shell
# 使用示例
curl -v \
     -H Authorization:'Basic YWRtaW46YWRtaW4=' \
     -X DELETE \
     http://localhost:2016/api/85581f40-70e7-11e6-85e3-674d3ab2db19
```

```
# Request
> DELETE /api/85581f40-70e7-11e6-85e3-674d3ab2db19 HTTP/1.1
> Host: localhost:2016
> User-Agent: curl/7.43.0
> Accept: */*
> Authorization:Basic YWRtaW46YWRtaW4=

# Response
< HTTP/1.1 200 OK
< Content-Type: application/json; charset=utf-8
< Content-Length: 535
< Date: Fri, 02 Sep 2016 09:00:19 GMT
< Connection: keep-alive

# Response Body
[  
   {  
      "location":"/demo1/",
      "proxy_pass":"http://localhost:7777/service/demo1-service/",
      "id":"9b0f6740-69d4-11e6-a2ca-976ed89ed127"
   },
   {  
      "location":"/demo2/",
      "proxy_pass":"http://localhost:7777/api/demo2-service/",
      "id":"a66e0470-69d4-11e6-a2ca-976ed89ed127"
   }
]
```