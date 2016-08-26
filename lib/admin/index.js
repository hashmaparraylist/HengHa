// koa and koa's middleware
let app = require('koa')();
let auth = require('koa-basic-auth');
let router = require('koa-router')();
let cors = require('kcors');
let bodyParser = require('koa-bodyparser');

// third party library
let _ = require('lodash');

// own's module
let routerSetting = require('./routers');
let constErrorMessage = require('../errors');
let logger;

// read admin config from global namespace
let startup = function() {

  // 设置koa的中间件    
  app.use(function *(next){
    try {
      yield next;
      // Handle 404 upstream.
      let status = this.status || 404;
      if (status === 404) this.throw(404, constErrorMessage.NOT_FOUND);
    } catch (err) {
      logger.debug('catch error:', err.status);
      this.status = err.status || 500;
      let message = err.message || constErrorMessage.INTERNAL_SERVER_ERROR;

      // 重写401错误
      if (err.status === 401) {
        message = constErrorMessage.UN_AUTHORIZED;
      }

      this.body = {
        error: message
      };

      this.app.emit('error', err, this);
    }
  });

  // 设置CROS
  app.use(cors());

  // 设置bodyparse
  app.use(bodyParser({
    onerror: (err, ctx) => {
      ctx.throw(constErrorMessage.UNPROCESSABLE_ENTITY, 422);
    }
  }));

  // 设置basic auth
  app.use(auth({
    name: this.config.authorization.user,
    pass: this.config.authorization.password
  }));

  // 设置koa-router
  router = initRouter(router);
  app.use(router.routes())
    .use(router.allowedMethods());

  // 设置标准错误流程
  app.on('error', webErrorHandler);

  // Strartup Admin Http
  app.listen(this.config.port, () => {
    logger.info(`Startup Admin Endpoint on port:${this.config.port}`);
  });

};

let initRouter = function(router) {

  _.forEach(routerSetting, (apis) => {
    _.forEach(apis, (api) => {

      let method = api.method.toUpperCase();
      let path = api.path;
      let generator = api.generator;

      logger.debug(`Bind router:[${method}, ${path}]`);

      if (method == 'GET') {
        router.get(path, generator);
      } else if (method == 'POST') {
        router.post(path, generator);
      } else if (method == 'PUT') {
        router.put(path, generator);
      } else if (method == 'DELETE') {
        router.delete(path, generator);
      } 
    });
  });

  return router;
};

let webErrorHandler = function(error, context) {
  logger.error(`Server Error Code: ${context.status}, Message:${error.message}`);
};

module.exports = {
  config: {},
  init: function(config, _logger) {
    this.config = config;
    logger = _logger;
  },
  startup: startup
};
