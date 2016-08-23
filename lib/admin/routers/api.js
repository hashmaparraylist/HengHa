// Nodejs' module
let fs = require('fs');
let _ = require('lodash');

// Third party module
let uuid = require('uuid');

const config = global.config;

// own's module
let logger = require('../../logger').get('admin', config.admin.logger);
let dataFile = config.data.file;

let apiDatas = _readData();

fs.watch(dataFile, (cur, prev) => {
  logger.debug('reload data file');
  apiDatas = _readData();
});

let _writeData = () => {
  fs.writeFileSync(dataFile, JSON.stringify(apiDatas));
};

let _readData = () => {
  return JSON.parse(fs.readFileSync(dataFile).toString() || []);
};

let apiSchema = {
  get: (id) => {
    let target = _.find(apiDatas, (element) => element === id );

    if (target) {
      return target;
    }

    return {};
  },

  create: (newApi) => {
    newApi.id = uuid.v1();
    apiDatas.push(newApi);
    _writeData();
    return newApi;
  },

  delete: (id) => {
    apiDatas = _.remove(apiDatas, function(element) {
      return element.id === id;
    });
    _writeData();
  },

  update: (id, target) => {
    let index = _.findIndex(apiDatas, (element) => element.id === id);
    if (index === -1) return {};
    let updated = _.assignIn({}, apiDatas[index], target);

    apiDatas[index] = updated;
    _writeData();
    return updated;
  }
};

// Get all api
let api = {};
api.get = {
  path: '/api',
  method: 'get',
  generator: function *(next) {
    this.body = apiDatas;
  }
};

// Get all api
api.getOne = {
  path: '/api/:id',
  method: 'get',
  generator: function *(next) {
    this.body = apiSchema.get(this.params.id);
  }
};

// Create a new api
api.create = {
  path: '/api',
  method: 'post',
  generator: function *(next) {
    let newApi = this.request.body;
    this.body = apiSchema.create(newApi);
  }
}

// Update a api
api.update = {
  path: '/api/:id',
  method: 'put',
  generator: function *(next) {
    let target = this.request.body;
    this.body = apiSchema.update(this.params.id, target);
  }
}

// Delete a api
api.delete = {
  path: '/api/:id',
  method: 'delete',
  generator: function *(next) {
    apiSchema.delete(this.params.id);
    this.body = apiDatas;
  }
}

module.exports = api;
