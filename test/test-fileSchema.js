const rewire = require("rewire");
const apiSchema = rewire('../lib/schema/file/index.js');
const assert = require('chai').assert;
const sinon = require('sinon');

const expectedPath = '/dev/null';
const originData = [{
  location: '/demo1/',
  proxy_pass: 'http://test.com/',
  id: 1,
}, {
  location: '/demo2/',
  proxy_pass: 'http://test2.com/',
  id: 2,
}, {
  location: '/demo3',
  proxy_pass: 'http://test3.com/',
  id: 3,
}, {
  location: '/demo4',
  proxy_pass: 'http://test4.com/',
  id: 4
}];

let stubData = originData;

let fsMock = {
  readFile: function(path, callback) {
    callback(null, new Buffer(JSON.stringify(stubData)));
  },
  writeFile: function(path, data, callback) {
    stubData = data;
    callback(null);
  },
  watch: function(path, callback) {
    callback();
  }
};

let fsErrorMock = {
  readFile: function(path, callback) {
    callback(new Error('Read File Error')); 
  },
  writeFile: function(path, data, callback) {
    callback(new Error('Write File Error'));
  },
  watch: function(path, callback) {
    callback();
  }
};

let uuidMock = {
  v1: function() {
    return 'test-v1';
  };
};

describe('fileSchema module', () => {

  before(() => {
    apiSchema.__set__('fs', fsMock); 
    apiSchema.__set__('uuid', uuidMock); 
  });

  describe('#init() #1', () => {

    it('Read api data on success', () => {
      apiSchema.init(expectedPath);
      let actualData = apiSchema.__get__('dataStorage');
      let actualPath = apiSchema.__get__('dataFile');
      assert.sameDeepMembers(actualData, originData, 'Same api data.');
      assert.equal(actualPath, expectedPath, 'file path is equal.');
    });

  });

  describe('#init() #2', ()=> {
    before(() => {
      apiSchema.__set__('fs', fsErrorMock); 
    });

    it('Read api data on failure', ()=> {
      assert.throws(apiSchema.init, 'Read File Error');
    });

    after(() => {
      apiSchema.__set__('fs', fsMock); 
    });
  });

  describe('#getAll()', () => {

    it('Get all api datas', (done) => {
      apiSchema.init(expectedPath);
      apiSchema.getAll()((error, data) => {
        if (error) {
          assert.isOk(false, 'this will passed!');
        } else {
          assert.sameDeepMembers(data, originData);
          let actualData = apiSchema.__get__('dataStorage');
          assert.sameDeepMembers(actualData, originData);
        }
        done(error);
      });
    });

  });

  describe('#get()', () => {
    it('Found api by id', (done) => {
      apiSchema.init(expectedPath);

      apiSchema.get(1)((error, data) => {
        assert.deepEqual(data, originData[0]);
        done(error);
      });
    });
    it('Not Found api by id', (done) => {
      apiSchema.init(expectedPath);

      apiSchema.get(0)((error, data) => {
        assert.deepEqual(data, {});
        done(error);
      });
    });
  });

  describe('#create()', () => {
    afterEach(() => {
      stubData = originData;
    });
  });

  describe('#update()', () => {
  });

  describe('#delete()', () => {
  });

  describe('#matcher()', () => {
  });

});
