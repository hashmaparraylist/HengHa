let chai = require('chai');
let sinon = require('sinon');

let rewire = require('rewire');
let assert = chai.assert;

// Mock
let loggerMock = {
  debug: function() {},
  info: function() {},
  error: function() {},
};

let interfaceMock = {
  api: {
    init: function() {},
    interface: {
      get: {
        path: '/get',
        method: 'get',
        generator: function*(next) {}
      },
      create: {
        path: '/post',
        method: 'post',
        generator: function*(next) {}
      },
      update: {
        path: '/put',
        method: 'put',
        generator: function*(next) {}
      },
      delete: {
        path: '/delete',
        method: 'delete',
        generator: function*(next) {}
      },
      option: {
        path: '/option',
        method: 'options',
        generator: function*(next) {}
      }
    }
  }
};

let appMock = {
  use: function(callback) {
    callback();
    return this;
  },
  on: function(category, callback) {
    callback(new Error('Foobar'), 'test');
  },
  listen: function(port, callback) {
    callback();
  }
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
  });
});
