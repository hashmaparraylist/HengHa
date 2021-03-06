let chai = require('chai');
let assert = chai.assert;
let expect = chai.expect;

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
  location: '/ba', 
  proxy_pass: 'http://b.com'
}, {
  location: '/bd', 
  proxy_pass: 'http://b.com'
}, {
  location: '^~ /abd/', 
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
  describe('#matcher() error handle', () => {
    it('unsupport regex location', () => {
      let error = target.matcher('/b', [{
        location: '~@ /hello/',
        proxy_pass: 'http://test.com'
      }]);

      expect(error).to.be.an('error');
    });

    it('too many location argument', () => {
      let error = target.matcher('/b', [{
        location: '~@ ~ /hello/',
        proxy_pass: 'http://test.com'
      }]);
      expect(error).to.be.an('error');
    });

  });
  describe('#matcher()', () => {
    it('find location in one element array', () => {
      let result = target.matcher('/b', [{
        location: '^~ /b/',
        proxy_pass: 'http://test.com'
      }]);
      expect(result).to.not.an('error');
    });

    it('find location in two element array', () => {
      let result = target.matcher('/b', [{
        location: '/b',
        proxy_pass: 'http://test.com'
      }, {
        location: '/a',
        proxy_pass: 'http://test.com'
      }, {
        location: '/c',
        proxy_pass: 'http://test.com'
      }]);
      expect(result).to.not.an('error');
    });

    it('find location by /b ', () => {
      let result = target.matcher('/b', apis);
      assert.equal(result.proxyPass, 'http://b.com');
    });

    it('find location by /ac ', () => {
      let result = target.matcher('/ac', apis);
      assert.equal(result.proxyPass, 'http://regex_ac.com');
      assert.equal(result.request_uri, '/');
    });

    it('find location by /ac/d ', () => {
      let result = target.matcher('/ac/d', apis);
      assert.equal(result.proxyPass, 'http://ac.com');
      assert.equal(result.request_uri, '//d');
    });

    it('find location by /acd ', () => {
      let result = target.matcher('/acd', apis);
      assert.equal(result.proxyPass, 'http://ac.com');
    });

    it('find location by /abd', () => {
      let result = target.matcher('/abd', apis);
      assert.equal(result.proxyPass, 'http://ab.com');
    });

    it('find location by /abd/', () => {
      let result = target.matcher('/abd/', apis);
      assert.equal(result.proxyPass, 'http://abd.com');
    });

    it('find location by /ck', () => {
      let result = target.matcher('/ck', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
    });

    it('find location by /CK', () => {
      let result = target.matcher('/CK', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
    });

    it('find location by /Ck', () => {
      let result = target.matcher('/Ck', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
      assert.equal(result.request_uri, '/');
    });

    it('find location by /cK/p', () => {
      let result = target.matcher('/cK/p', apis);
      assert.equal(result.proxyPass, 'http://ck.com');
      assert.equal(result.request_uri, '//p');
    });
    it('find location by /de', () => {
      let result = target.matcher('/de', apis);
      assert.equal(result.proxyPass, 'http://de.com');
    });
    it('find location by /dea', () => {
      let result = target.matcher('/dea', apis);
      assert.equal(result.proxyPass, 'http://de.com');
    });
    it('find location by /de/a', () => {
      let result = target.matcher('/de/a', apis);
      assert.equal(result.proxyPass, 'http://de.com');
    });
    it('find location by /dE', () => {
      let result = target.matcher('/dE', apis);
      assert.isNull(result);
    });
    it('find location by /DE', () => {
      let result = target.matcher('/DE', apis);
      assert.isNull(result);
    });
  });
});
