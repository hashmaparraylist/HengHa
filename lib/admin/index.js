// koa and koa's middleware
let app = require('koa')();
let auth = require('koa-basic-auth');
let router = require('koa-router')();
let cors = require('kcors');

// third party library
let _ = require('lodash');

// own's module
let routerSetting = require('./routers');
let logger;  

let startup = (config) => {

  logger = require('../logger').get('admin', config.logger);

  // 设置koa的中间件    
  app.use(function *(next){
    try {
      yield next;
      // Handle 404 upstream.
      let status = this.status || 404;
      if (status === 404) this.throw(404);
    } catch (err) {
      logger.debug('catch error:', err.status);
      this.status = err.status || 500;
      // TBD refactor error return
      // TBD add 401 error
      this.type = 'json';
      this.body = {
        message: err.message
      };

      this.app.emit('error', err, this);
    }
  });

  // 设置CROS
  app.use(cors());

  // 设置basic auth
  app.use(auth({
    name: config.authorization.user,
    pass: config.authorization.password
  }));

  // 设置koa-router
  router = initRouter(router);
  app.use(router.routes())
    .use(router.allowedMethods());

  // 设置标准错误流程
  app.on('error', webErrorHandler);

  // Strartup Admin Http
  app.listen(config.port, () => {
    logger.info(`Startup Admin Endpoint on port:${config.port}`);
  });

};

let initRouter = (router) => {

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

let webErrorHandler = (error, context) => {
  logger.error(`Server Error Code: ${context.status}, Message:${error.message}`);
};


module.exports = startup;
