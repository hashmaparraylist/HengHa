const errors = require('../lib/errors');
const expect = require('chai').expect;
const _ = require('lodash');

describe('error module', () => {

  it('error\'s content', () => {
    _.each(errors, (val, key) => {
      expect(val).to.be.a('string');
    });
  });
  
});

