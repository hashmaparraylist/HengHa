let koa = require('koa');
let app = koa();


let startup = (config) => {
  let logger = require('../logger').get('gateway', config.logger);

  // GET /js/jquery.js
  app.use(function *(next) {
    logger.debug(this.url);
    this.redirect('http://localhost:3000' + this.url);
  });

  app.listen(config.port, () => {
    logger.info(`Startup G/W Endpoint on port:${config.port}`);
  });
};

module.exports = startup
