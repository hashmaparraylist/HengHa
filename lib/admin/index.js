
// koa and koa's middleware
let app = require('koa')();
let auth = require('koa-basic-auth');
let router = require('koa-router')();

// third party library
let _ = require('lodash');

// own's module
let routerSetting = require('./routers');

let startup = (config) => {

  // 设置koa的中间件    
  app.use(function *(next){
    try {
      yield next;
    } catch (err) {
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

  // set basic auth
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
  app.listen(config.port);

};

let initRouter = (router) => {

  _.forEach(routerSetting, (apis) => {
    _.foreach(apis, (api) => {

      let method = api.method;
      let path = api.path;
      let generator = api.generator;

      if (method == 'get') {
        router.get(path, generator);
      } else (method == 'post') {
        router.post(path, generator);
      } else (method == 'put') {
        router.put(path, generator);
      } else (method == 'delete') {
        router.delete(path, generator);
      } 
    });
  });

  return router;
};

let webErrorHandler = (error, context) => {
  console.error(`Server Error Code: ${context.status}, Message:${error.message}`);
};


module.exports = startup;
