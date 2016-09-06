let chai = require('chai');
let sinon = require('sinon');
let superagent = require('superagent');
let async = require('async');
let constErrorMessage  = require('../lib/errors');

let rewire = require('rewire');
let assert = chai.assert;

// Mock
let loggerMock = {
  debug: function(msg) {},
  info: function(msg) {},
  error: function() {},
};

let interfaceMock = {
  api: {
    init: function() {},
    interface: {
      get: {
        path: '/get',
        method: 'get',
        generator: function*(next) {
          this.body = 'hello, world!'
        }
      },
      getError: {
        path: '/getError',
        method: 'get',
        generator: function*(next) {
          this.throw();
        }
      },
      create: {
        path: '/post',
        method: 'post',
        generator: function*(next) {
          this.body = 'hello, world!'
        }
      },
      update: {
        path: '/put',
        method: 'put',
        generator: function*(next) {
          this.body = 'hello, world!'
        }
      },
      delete: {
        path: '/delete',
        method: 'delete',
        generator: function*(next) {
          this.body = 'hello, world!'
        }
      },
      option: {
        path: '/option',
        method: 'options',
        generator: function*(next) {
          this.body = 'hello, world!'
        }
      }
    }
  }
};

let appMock = {
  middlewares: [],
  use: function(callback) {
    if (callback.constructor.name === 'GeneratorFunction') {
      this.middlewares.push(callback);
    } else {
      callback();
    }
    return this;
  },
  on: function(category, callback) {
    callback(new Error('Foobar'), 'test');
  },
  listen: function(port, callback) {
    callback();
  },
  app: {
    emit: function() {}
  },
  throw: function() {}
};

// Test Data
let config = {
  admin: {
    port: 1234,
    authorization: {
      user: 'usr',
      password: 'passwd'
    }
  }
};


let target;

describe('admin module', () => {
  describe('#init()', () => {
    it('success call', () => {
      target = rewire('../lib/admin/index.js');
      target.init(config, loggerMock);

      assert.deepEqual(target.config, config);
    });
  });

  describe('#startup()', () => {
    beforeEach(() => {
      target = rewire('../lib/admin/index.js');
      target.init(config, loggerMock);
      appMock.generators = [];
    });

    it('test routerSetting and app.listen', () => {
      let spyInterfaceInit = sinon.spy(interfaceMock.api, 'init');
      let spyAppListen = sinon.spy(appMock, 'listen');

      target.__set__('routerSetting', interfaceMock);
      target.__set__('app', appMock);
      target.startup();

      assert.isOk(spyInterfaceInit.calledOnce, 'api router init be called once');
      assert.isOk(spyInterfaceInit.calledWith(config), 'api router init be called with param');
      assert.isOk(spyAppListen.calledWithMatch(config.admin.port), 
        'app listen on the port what defined in the config');
    });

    it('test cors and bodyparse', () => {
      target.__set__('routerSetting', interfaceMock);
      target.__set__('app', appMock);

      let corsMock = function() {
        return function() {};
      };
      let spyCors = sinon.spy(corsMock);
      target.__set__('cors', spyCors);

      let bodyParser = function(config) {
        config.onerror(null, {
          throw: function() {}
        });
        return function() {};
      }

      let spyBodyParse = sinon.spy(bodyParser);
      target.__set__('bodyParser', spyBodyParse);

      target.startup();

      assert.isOk(spyCors.calledOnce, 'cors be called');
      assert.isOk(spyBodyParse.calledOnce, 'bodyParse be called');
    });

    it('test basic auth', () => {
      target.__set__('routerSetting', interfaceMock);
      target.__set__('app', appMock);

      let auth = function(config) {
        return function() {};
      };

      let spy = sinon.spy(auth);

      target.__set__('auth', spy);
      target.startup();

      assert.isOk(spy.calledOnce, 'called once');
      assert.isOk(spy.calledWith({
        name: config.admin.authorization.user,
        pass: config.admin.authorization.password
      }), 'called with argument');
    
    });

    it('test main', (done) => {
      target.__set__('routerSetting', interfaceMock);
      target.startup();
      async.waterfall([function(callback) {
        superagent
          .get('http://localhost:1234/get')
          .set('Authorization', 'Basic dXNyOnBhc3N3ZA==')
          .set('Accept', '*/*')
          .end(function(error, response) {
            assert.isNull(error, 'test main on 200 / assert status');
            assert.equal(response.text, 'hello, world!', 'test main on 200 / assert body');
            callback();
          });
      }, function(callback) {
        superagent
          .get('http://localhost:1234/getError')
          .set('Authorization', 'Basic dXNyOnBhc3N3ZA==')
          .set('Accept', '*/*')
          .end(function(error, response) {
            assert.equal(error.status, 500, 'test main on 500 / assert status');
            callback();
          });

      }, function(callback) {
        superagent
          .get('http://localhost:1234/user')
          .set('Authorization', 'Basic dXNyOnBhc3N3ZA==')
          .end((error, response) => {
            assert.equal(error.status, 404, 'test main on 404 / assert status');
            assert.deepEqual(response.body, {
              error: constErrorMessage.NOT_FOUND
            }, 'test main on 404 / assert body');
            callback();
          });
      }, function(callback) {
        superagent
          .get('http://localhost:1234/get')
          .end((error, response) => {
            assert.equal(error.status, 401, 'test main on 401 / assert status');
            assert.deepEqual(response.body, {
              error: constErrorMessage.UN_AUTHORIZED
            }, 'test main on 401 / assert body');
            callback();
          });
      }], function(error) {
        done();
      });
    });
  });
});
