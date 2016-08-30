const rewire = require("rewire");
const apiSchema = rewire('../lib/schema/file/index.js');
const assert = require('chai').assert;
const sinon = require('sinon');

const expectedPath = '/dev/null';
let originData = function() {
  return [{
      location: '/demo1/',
      proxy_pass: 'http://test.com/',
      id: '1',
    }, {
      location: '/demo2/',
      proxy_pass: 'http://test2.com/',
      id: '2',
    }, {
      location: '/demo3',
      proxy_pass: 'http://test3.com/',
      id: '3',
    }, {
      location: '/demo4',
      proxy_pass: 'http://test4.com/',
      id: '4'
    }];
};

let stubData = originData();

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
  }
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
      assert.sameDeepMembers(actualData, originData(), 'Same api data.');
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
    beforeEach(() => {
      apiSchema.init(expectedPath);
    });

    it('Get all api datas', (done) => {
      apiSchema.getAll()((error, data) => {
        if (error) {
          assert.isOk(false, 'this will passed!');
        } else {
          assert.sameDeepMembers(data, originData());
          let actualData = apiSchema.__get__('dataStorage');
          assert.sameDeepMembers(actualData, originData());
        }
        done(error);
      });
    });

  });

  describe('#get()', () => {

    beforeEach(() => {
      apiSchema.init(expectedPath);
    });

    it('Found api by id', (done) => {
      apiSchema.get('1')((error, data) => {
        assert.deepEqual(data, originData()[0]);
        done(error);
      });
    });

    it('Not Found api by id', (done) => {
      apiSchema.get(0)((error, data) => {
        assert.deepEqual(data, {});
        done(error);
      });
    });
  });

  describe('#create()', () => {

    beforeEach(() => {
      apiSchema.init(expectedPath);
    });

    it('Create a new Data', (done) => {
      let expectedDatas = originData();
      let expectedData = {
        id: uuidMock.v1(),
        location: '/demoX',
        proxy_pass: 'http://www.b.com'
      };
      expectedDatas.push(expectedData);
      apiSchema.create({
        location: '/demoX',
        proxy_pass: 'http://www.b.com'
      })((error, data) => {
        assert.deepEqual(data, expectedData, 'API\'s id is generated');
        assert.sameDeepMembers(apiSchema.__get__('dataStorage'), expectedDatas, 'API is added into storage.');
        done(error);
      });
    });

    afterEach(() => {
      stubData = originData();
    });
  });

  describe('#update()', () => {

    beforeEach(() => {
      apiSchema.init(expectedPath);
    });

    it('Update data\'s location', (done) => {
      let updateContext = {
        location: 'update-demo'
      };

      let expectedDatas = originData();
      expectedDatas[2].location = updateContext.location;
      apiSchema.update('3', updateContext)((error, datas) => {
        assert.sameDeepMembers(datas, expectedDatas);
        done(error);
      });
    });

    it('Update data\'s proxy_pass', (done) => {
      let updateContext = {
        proxy_pass: 'www.proxy_pass.com'
      };

      let expectedDatas = originData();
      expectedDatas[1].proxy_pass = updateContext.proxy_pass;
      apiSchema.update(expectedDatas[1].id, updateContext)((error, datas) => {
        assert.sameDeepMembers(datas, expectedDatas);
        done(error);
      });
    });

    it('Update data\'s all property', (done) => {
      let updateContext = {
        location: '/update-all',
        proxy_pass: 'http://www.all.com'
      };

      let expectedDatas = originData();
      expectedDatas[3].location = updateContext.location;
      expectedDatas[3].proxy_pass = updateContext.proxy_pass;
      apiSchema.update(expectedDatas[3].id, updateContext)((error, data) => {
        assert.sameDeepMembers(data, expectedDatas);
        done(error);
      });
    });

    afterEach(() => {
      stubData = originData();
    });
    
  });

  describe('#delete()', () => {
    beforeEach(() => {
      apiSchema.init(expectedPath);
    });

    it('Delete a exists id', (done) => {
      let expectedDatas = originData();
      let deletedObject = expectedDatas.slice(1, 1);
      
      apiSchema.delete(deletedObject.id)((error, data) => {
        assert.sameDeepMembers(data, expectedDatas);
        done(error);
      });
    });

    it('Delete a not exists id', (done) => {
      apiSchema.delete('100')((error, data) => {
        assert.sameDeepMembers(data, originData());
        done(error);
      });
    });

    afterEach(() => {
      stubData = originData();
    });
  });

  describe('#delete() external test', () => {
    before(() => {
      apiSchema.init(expectedPath);
    });

    it('Delete all api', (done) => {
      apiSchema.delete('1')((error, data) => {
        apiSchema.delete('2')((error, data) => {
          apiSchema.delete('3')((error, data) => {
            apiSchema.delete('4')((error, data) => {
              assert.sameMembers(data, []);
              apiSchema.delete('4')((error, data) => {
                assert.sameMembers(data, []);
                done(error);
              });
            });
          });
        });
      });
    });

    after(() => {
      stubData = originData();
    });
  });

  describe('#matcher()', () => {
    beforeEach(() => {
      apiSchema.init(expectedPath);
    });

    it('match a location with last slash #1', (done) => {
      apiSchema.matcher('/demo1/', (error, data) => {
        assert.equal(data.proxy_pass, 'http://test.com/');
        done(error);
      });
    });

    it('match a location with last slash #2', (done) => {
      apiSchema.matcher('/demo3/', (error, data) => {
        assert.equal(data.proxy_pass, 'http://test3.com/');
        done(error);
      });
    });

    it('match a location without last slash #1', (done) => {
      apiSchema.matcher('/demo2', (error, data) => {
        assert.equal(data.proxy_pass, 'http://test2.com/');
        done(error);
      });
    });

    it('match a location without last slash #1', (done) => {
      apiSchema.matcher('/demo4', (error, data) => {
        assert.equal(data.proxy_pass, 'http://test4.com/');
        done(error);
      });
    });
  });

});
