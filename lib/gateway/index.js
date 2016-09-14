// Node.js module
let fs = require('fs');
let http = require('http');
let url = require('url');
let schema = require('../schema/file/');

// Third party Module
let httpProxy = require('http-proxy');

let proxy = httpProxy.createProxyServer({});
let logger = null;

let startup = function() {
  http.createServer((req, res) => {
    let reqUrl = url.parse(req.url);
    let pathname = reqUrl.pathname.split('/');

    logger.debug(`find pathname=${reqUrl.pathname}`);
    schema.matcher(reqUrl.pathname, (error, site) => {
      if (site) {
        logger.debug(`proxy url=${req.url} to site=${site.proxy_pass}${site.request_uri}`);
        req.url = site.request_uri;
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
