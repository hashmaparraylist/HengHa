let api = {};

// Get all api
api.get = {
  path: '/api',
  method: 'get',
  generator: function *(next) {
  }
};

// Get all api
api.getOne = {
  path: '/api/:id',
  method: 'get',
  generator: function *(next) {
  }
};

// Create a new api
api.create = {
  path: '/api',
  method: 'post',
  generator: function *(next) {
  }
}

// Update a api
api.update = {
  path: '/api/:id',
  method: 'put',
  generator: function *(next) {
  }
}

// Delete a api
api.delete = {
  path: '/api/:id',
  method: 'delete',
  generator: function *(next) {
  }
}

module.exports = api;