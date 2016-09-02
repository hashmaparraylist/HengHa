// Nodejs' module
let fs = require('fs');
let _ = require('lodash');
let schema = require('../../schema/file/');

let api = {
  config: {},
  interface: {}
};
api.init = function(_config) {
  this.config = _config; 
  schema.init(this.config.data.file);
};

// Get all api
api.interface.get = {
  path: '/api',
  method: 'get',
  generator: function *(next) {
    let resData = yield schema.getAll();
    this.body = resData;
  }
};

// Get all api
api.interface.getOne = {
  path: '/api/:id',
  method: 'get',
  generator: function *(next) {
    let resData = yield schema.get(this.params.id);
    this.body =  resData; 
  }
};

// Create a new api
api.interface.create = {
  path: '/api',
  method: 'post',
  generator: function *(next) {
    let resData = yield schema.create(this.request.body);
    this.body = resData;
  }
}

// Update a api
api.interface.update = {
  path: '/api/:id',
  method: 'put',
  generator: function *(next) {
    let resData = yield schema.update(this.params.id, this.request.body);
    this.body = resData;
  }
}

// Delete a api
api.interface.delete = {
  path: '/api/:id',
  method: 'delete',
  generator: function *(next) {
    let resData = yield schema.delete(this.params.id);
    this.body = resData;
  }
}

module.exports = api;
