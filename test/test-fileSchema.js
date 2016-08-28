const rewire = require("rewire");
const apiSchema = rewire('../lib/schema/file/index.js');
const assert = require('chai').assert;

const expectedPath = '/dev/null';
const originData = [{
  location: '/demo1/',
  proxy_pass: 'http://test.com/'
}, {
  location: '/demo2/',
  proxy_pass: 'http://test2.com/'
}, {
  location: '/demo3',
  proxy_pass: 'http://test3.com/'
}, {
  location: '/demo4',
  proxy_pass: 'http://test4.com/'
}];

let fsMock = {
  readFile: function(path, callback) {
    assert.equal(path, expectedPath); 
    callback(null, new Buffer(JSON.stringify(originData)));
  },
  writeFile: function(path, data, callback) {
  },
  watch: function(path, callback) {
    assert.equal(path, expectedPath); 
  }
};

describe('fileSchema module', () => {

  before(() => {
    apiSchema.__set__('fs', fsMock); 
  });

  describe('#init()', () => {
    it('read a data', () => {
      apiSchema.init(expectedPath);
      let actualData = apiSchema.__get__('dataStorage');
      let actualPath = apiSchema.__get__('dataFile');
      assert.sameDeepMembers(actualData, originData, 'Same api data.');
      assert.equal(actualPath, expectedPath, 'file path is equal.');
    });
  });
  describe('#getAll()', () => {
  });
  describe('#get()', () => {
  });
  describe('#create()', () => {
  });
  describe('#update()', () => {
  });
  describe('#delete()', () => {
  });
  describe('#matcher()', () => {
  });
});
