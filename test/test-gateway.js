let rewire = require('rewire');
let assert = require('chai').assert;
let expect = require('chai').expect;
let sinon = require('sinon');
// Mock 
let proxyMock = {
  web: function(req, res, object) {}
}

let httpProxyMock = {
  createProxyServer: function(obj) {}
};

let schemaMatchedMock = {
  matcher: function(pathname, callback) {
    callback(null, proxySite);
  },
  init: function(file) {}
};

let schemaUnMatchedMock = {
  matcher: function(pathname, callback) {
    callback(null, null);
  },
  init: function(file) {}
};

let httpMock = {
  testFn: null,
  createServer: function(callback) {
    this.testFn = callback;
    return this;
  },
  listen: function() {}
};

// Test expect data
let expectPath = '/dev/null';
let expectConfig = {
  data: {
    file: expectPath
  },
  gateway: {
    port: 1234
  }
};
let expectLogger = {
  debug: function() {},
  info: function() {}
};

let proxySite = {
  location: '/demo1/',
  proxy_pass: 'http://abc.com',
  pattern: '/demo1/*'
};

// Test target
let gateway; 

describe('gateway module', () => {


  describe('#init()', () => {
    before(() => {
      gateway = rewire('../lib/gateway/index.js');
      gateway.__set__('schema', schemaMatchedMock);
    });

    it('success called', () => {
      let spy = sinon.spy(schemaMatchedMock, 'init');
      gateway.init(expectConfig, expectLogger);
      assert.deepEqual(gateway.config, expectConfig, 'gateway\'s member config is ok');
      assert.isOk(spy.calledOnce, 'schema\'s init method is called once');
      assert.isOk(spy.calledWith(expectPath), 'schema init method\'s param is ok');
    });
  });

  describe('#startup', () => {
    beforeEach(() => {
      gateway = rewire('../lib/gateway/index.js');
    });
    it('find proxy', () => {
      let spySchemaMatcher = sinon.spy(schemaMatchedMock, 'matcher');
      let spyHttpListen = sinon.spy(httpMock, 'listen');
      let spyProxyWeb = sinon.spy(proxyMock, 'web');

      gateway.init(expectConfig, expectLogger);
      gateway.__set__('schema', schemaMatchedMock);
      gateway.__set__('http', httpMock);
      gateway.__set__('httpProxy', httpProxyMock);
      gateway.__set__('proxy', proxyMock);

      gateway.startup();

      let req = {
        url : 'http://localhost/demo1/test'
      };
      let res = {
      };

      httpMock.testFn(req, res);

      // http's listen method
      assert.isOk(spyHttpListen.calledOnce,
          'http\'s listen method be called once');
      assert.isOk(spyHttpListen.calledWith(expectConfig.gateway.port), 
          'http\'s listen method be called by port');

      // schema's matcher method
      assert.isOk(spySchemaMatcher.calledOnce, 
          'schema\'s matcher be called once');
      assert.equal(spySchemaMatcher.args[0][0], '/demo1/test', 
          'schema\'s matcher be called with params');

      // proxy's web method 
      assert.isOk(spyProxyWeb.calledOnce, 'proxy\'s web is called once');
      assert.isOk(spyProxyWeb.calledWithMatch({ url: undefined }, res, {target: proxySite.proxy_pass}),
        'proxy\'s web is called once with params');
    });

    it('can not find proxy', () => {
      let req = {
        url : '/demo1/test'
      };
      let res = {
        statusCode: 0,
        end: function() {}
      };

      let spyRes = sinon.spy(res, 'end');
      spyRes.withArgs('Not Found');

      gateway.init(expectConfig, expectLogger);
      gateway.__set__('schema', schemaUnMatchedMock);
      gateway.__set__('http', httpMock);
      gateway.__set__('httpProxy', httpProxyMock);
      gateway.__set__('proxy', proxyMock);

      gateway.startup();
      httpMock.testFn(req, res);


      assert.equal(404, res.statusCode);
      assert.isOk(spyRes.withArgs('Not Found').calledOnce);
    });
  });
});
