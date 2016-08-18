let app = require('koa')();
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
  app.use(function *() {
    this.throw(401, "Auth Error");
  });

  // 设置标准错误流程
  app.on('error', webErrorHandler);

  // Strartup Admin Http
  app.listen(config.port);

};

let webErrorHandler = (error, context) => {
  console.error(`Server Error Code: ${context.status}, Message:${error.message}`);
};


module.exports = startup;
