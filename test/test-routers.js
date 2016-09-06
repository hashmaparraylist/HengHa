let rewire = require('rewire');
let chai = require('chai');
let sinon = require('sinon');

let assert = chai.assert;
let expect = chai.expect

let target;

let testConfig = {
  data: {
    file: '/dev/null'
  }
};

let schemaMock = {
  init: function() {},
  getAll: function() {},
  get: function() {},
  create: function() {},
  update: function() {},
  delete: function() {}
};

describe('router moudle', () => {
  before(() => {
    target = rewire('../lib/admin/routers/api.js');
    target.__set__('schema', schemaMock);
  });
  describe('#init()', () => {
    it('success call init', () => {
      let spy = sinon.spy(schemaMock, 'init');

      target.init(testConfig);

      assert.deepEqual(target.config, testConfig);
      assert.isOk(spy.calledWith(testConfig.data.file));
    });
  });

  describe('#interface.get()', () => {
    it('success call', () => {
      target.init(testConfig);
      let spy = sinon.spy(schemaMock, 'getAll');
      let generator = target.interface.get.generator();
      generator.next();
      generator.next({
        test: 'dummy'
      });

      assert.isOk(spy.calledOnce);
      assert.deepEqual(target.interface.get.body, {
        test: 'dummy'
      });
    });
  });

  describe('#interface.getOne()', () => {
    it('success call', () => {
      target.init(testConfig);
      let spy = sinon.spy(schemaMock, 'get');

      let testId = 'test1';
      target.interface.getOne.params = {
        id: testId
      };

      let generator = target.interface.getOne.generator();
      generator.next();
      generator.next({
        test: 'interface.getOne()'
      });

      assert.isOk(spy.calledOnce);
      assert.isOk(spy.calledWith(testId));
      assert.deepEqual(target.interface.getOne.body, {
        test: 'interface.getOne()'
      });
    });
  });

  describe('#interface.create()', () => {
    it('success call', () => {
      target.init(testConfig);
      let spy = sinon.spy(schemaMock, 'create');

      let testData = {
        id: 'test',
        value: 'content'
      };
      target.interface.create.request= {
        body: testData
      };

      let generator = target.interface.create.generator();
      generator.next();
      generator.next({
        test: 'interface.create()'
      });

      assert.isOk(spy.calledOnce);
      assert.isOk(spy.calledWith(testData));
      assert.deepEqual(target.interface.create.body, {
        test: 'interface.create()'
      });
    });
  });

  describe('#interface.update()', () => {
    it('success call', () => {
      target.init(testConfig);
      let testId = 123;
      let testData = {
        key: 'key1',
        value: 'value1'
      };
      let testData2 = {
        key: 'key2',
        value: 'value2'
      };

      target.interface.update.params = {
        id: testId
      };
      target.interface.update.request= {
        body: testData
      };

      let spy = sinon.spy(schemaMock, 'update');
      let generator = target.interface.update.generator();
      generator.next();
      generator.next(testData2);

      assert.isOk(spy.calledOnce);
      assert.isOk(spy.calledWith(testId, testData));
      assert.deepEqual(target.interface.update.body, testData2);
    });
  });

  describe('#interface.delete()', () => {
    it('success call', () => {
      target.init(testConfig);
      let testId = 'testDelete';
      let testData = {
        key: 'keyDelete',
        value: 'valueDelete'
      };
      target.interface.delete.params = {
        id: testId
      };

      let spy = sinon.spy(schemaMock, 'delete');
      let generator = target.interface.delete.generator();
      generator.next();
      generator.next(testData);

      assert.isOk(spy.calledOnce);
      assert.isOk(spy.calledWith(testId));
      assert.deepEqual(target.interface.delete.body, testData);
    });
  });

});
