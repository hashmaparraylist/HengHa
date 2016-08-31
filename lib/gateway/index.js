// Node.js module
let fs = require('fs');
let http = require('http');
let url = require('url');
let schema = require('../schema/file/');

// Third party Module
let _ = require('lodash');
let httpProxy = require('http-proxy');
let proxy = httpProxy.createProxyServer({});

let startup = function() {
  http.createServer((req, res) => {
    let reqUrl = url.parse(req.url);
    let pathname = reqUrl.pathname.split('/');

    schema.matcher(reqUrl.pathname, (error, proxySite) => {
      if (proxySite) {
        let site = proxySites[0];
        req.url = req.url.replace(new RegExp(site.pattern), '');
        proxy.web(req, res, {target: site.proxy_pass });
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });
  }).listen(this.config.gateway.port);

  logger.info(`Startup Gateway Endpoint on port:${this.config.gateway.port}`);
};

module.exports = {
  config: {},
  init: function(_config, _logger) {
    this.config = _config;
    schema.init(this.config.data.file);
    logger = _logger;
  },
  startup: startup
};
