let app = require('koa')();
let _ = require('lodash');
let routerSetting = require('./routers');
let router = require('koa-router')();

let startup = (config) => {

  // 设置koa的中间件    
  app.use(function *(next){
    try {
      yield next;
    } catch (err) {
      this.status = err.status || 500;
      this.type = 'json';
      this.body = {
        message: err.message
      };

      this.app.emit('error', err, this);
    }
  });

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
