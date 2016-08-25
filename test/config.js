const assert = require('assert');
const configLoader = require('../lib/config');
const path = require('path');

describe('Config', () => {
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
});
