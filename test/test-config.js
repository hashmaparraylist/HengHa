const configLoader = require('../lib/config');
const path = require('path');
const fs = require('fs');
const assert = require('chai').assert;
const expect = require('chai').assert;

describe('config module', () => {

  describe('#getConfig()', () => {
    it('do no specify custom file', () => {
      let actual = configLoader.getConfig('');
      assert.deepEqual(actual, configLoader.defaultConfig);
    });

    it('specify custon file', () => {
      let filePath = path.resolve(__dirname, './support/config.json');
      let actual = configLoader.getConfig(filePath);
      let expected = configLoader.defaultConfig;
      expected.admin.logger.level = 'error';
      assert.deepEqual(actual, expected);
    });
  });

  describe('#generateDataFile()', () => {
    const testDataFilePath = './support/hengha.json';
    const exceptedFilePath = path.resolve(__dirname, testDataFilePath);

    let _deleteFile = (filePath, callback) => {
      fs.access(filePath, fs.R_OK | fs.W_OK, (error) => {
        if (error) {
          callback();
        } else {
          fs.unlink(filePath, callback);
        }
      })
    }

    // delete test data file before test
    beforeEach((done) => {
      _deleteFile(exceptedFilePath, done);
    });

    it('auto updated data file path', () => {
      let config = configLoader.defaultConfig;
      let expected = path.resolve(__dirname, testDataFilePath);
      config.data.file = expected;
      config = configLoader.generateDataFile(config);
      assert.equal(config.data.file, path.resolve(__dirname, expected));
    });

    it('auto generate data file', (done) => {
      let config = configLoader.defaultConfig;
      let expected = path.resolve(__dirname, testDataFilePath);
      config.data.file = expected;
      config = configLoader.generateDataFile(config);
      fs.access(exceptedFilePath, fs.R_OK | fs.W_OK, done);
    });

    // delete test data file after test
    afterEach((done) => {
      _deleteFile(exceptedFilePath, done);
    });
  });
});
