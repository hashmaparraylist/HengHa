// Node.js module
let fs = require('fs');
let http = require('http');
let url = require('url');

// Third party Module
let _ = require('lodash');
let httpProxy = require('http-proxy');

let proxy = httpProxy.createProxyServer({});

let config = global.config.gateway;
let dataFile = global.config.data.file;
let logger = require('../logger').get('gateway', config.logger);

// Read Api datas from data file
let _readData = (file) => {
  return JSON.parse(fs.readFileSync(file).toString() || '[]');
};

let startup = () => {
  let apiDatas = _readData(dataFile);

  // Watch data file and reload data when data file is updated
  fs.watch(dataFile, (cur, prev) => {
    apiDatas = _readData(dataFile);
  });

  http.createServer((req, res) => {
    let reqUrl = url.parse(req.url);
    let pathname = reqUrl.pathname.split('/');

    let apis = apiDatas.map((element) => {
      let pattern = element.location;
      if (element.location[element.location.length - 1] == '/') {
        pattern += '*';
      } else {
        pattern += '/*';
      }
      
      element.pattern = pattern;
      return element;
    });

    let proxySites = apis.filter((element) => {

      let regexp = new RegExp(element.pattern);
      return regexp.test(reqUrl.pathname);
      //let location = element.location.split('/');
      //if (pathname.length < location.length) return false;
      //let result = true;
      //location.forEach((value, index) => {
      //  result = (value == pathname[index]);
      //});
      //return result;
    });

    if (proxySites.length === 0) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    let site = proxySites[0];
    req.url = req.url.replace(new RegExp(site.pattern), '');
    proxy.web(req, res, {target: site.proxy_pass });

  }).listen(config.port);

  logger.info(`Startup Gateway Endpoint on port:${config.port}`);
};

module.exports = startup
