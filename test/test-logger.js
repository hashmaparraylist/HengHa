let assert = require('chai').assert;
let expect = require('chai').expect;
let rewire = require('rewire');
let sinon = require('sinon');

let logger = rewire('../lib/logger/index.js');

let winstonMock = {
  loggers: {
    add: function(category, config) {},
    get: function(category) {
      return category;
    }
  }
};

describe('logger module', () => {

  describe('#get()', () => {

    it('success called winston', () => {
      let spy = sinon.spy(winstonMock.loggers, 'add');

      logger.__set__('winston', winstonMock);
      
      let category = logger.get('test', {
        level: 'debug'
      });

      assert.equal(category, 'test');
      assert.isOk(spy.calledOnce);

      spy.reset();

      logger.get('test', {
        level: 'debug'
      });

      assert.isNotOk(spy.calledOnce);

    });
  });

});
