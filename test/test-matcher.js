let chai = require('chai');
let assert = chai.assert;

let target = require('../lib/matcher/');

let apis = [{
  location: '/a', 
  proxy_pass: 'http://a.com'
}, {
  location: '/ab', 
  proxy_pass: 'http://ab.com'
}, {
  location: '/ac', 
  proxy_pass: 'http://ac.com'
}, {
  location: '/b', 
  proxy_pass: 'http://b.com'
}, {
  location: '/d', 
  proxy_pass: 'http://d.com'
}, {
  location: '^~ /abd', 
  proxy_pass: 'http://abd.com'
}, {
  location: '~* /ck', 
  proxy_pass: 'http://ck.com'
}, {
  location: '~ /de', 
  proxy_pass: 'http://de.com'
}, {
  location: '= /ac', 
  proxy_pass: 'http://regex_ac.com'
}];

describe('matcher module', () => {
  describe('#matcher()', () => {
    it('find location by /b ', () => {
      let result = target.matcher('/b', apis);
      assert.equal(result.proxyPass, 'http://b.com');
    });

    it('find location by /ac ', () => {
      let result = target.matcher('/ac', apis);
      assert.equal(result.proxyPass, 'http://regex_ac.com');
    });

    it('find location by /ac/d ', () => {
      let result = target.matcher('/ac/d', apis);
      assert.equal(result.proxyPass, 'http://ac.com');
    });

    it('find location by /ab', () => {
      let result = target.matcher('/ab', apis);
      assert.equal(result.proxyPass, 'http://ab.com');
    });

    it('find location by /ck', () => {
      let result = target.matcher('/ck', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
    });

    it('find location by /CK', () => {
      let result = target.matcher('/ck', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
    });

    it('find location by /Ck', () => {
      let result = target.matcher('/Ck', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
    });

    it('find location by /cK/p', () => {
      let result = target.matcher('/cK/p', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
    });
  });
});
