let assert = require('chai').assert;
let expect = require('chai').expect;
let rewire = require('rewire');
let sinon = require('sinon');

let logger = rewire('../lib/logger/index.js');

let winstonMock = {
  loggers: {
    categories: [],
    add: function(category, config) {
      this.categories[category] = config;
    },
    get: function(category) {
      return this.categories[category];
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

      assert.isOk(spy.calledOnce);
      assert.equal(category.console.level, 'debug');
      expect(category.console.timestamp()).to.be.a('Date');
      let data = category.console.formatter({
        timestamp: function() {
          return new Date();
        },
        level: 'debug',
        message: 'test',
        meta: 'test2'
      });

      expect(data).to.be.a('string');

      spy.reset();

      logger.get('test', {
        level: 'debug'
      });

      assert.isNotOk(spy.calledOnce);

    });
  });

});
