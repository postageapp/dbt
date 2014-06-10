var fs = require('fs');
var path = require('path');

var helper = require('./helper');
var escape = require('../lib/dbt/escape');

var assert = helper.assert;

describe('dbt', function() {
  describe('escape', function() {
    describe('keyword()', function() {
      it('should handle escaping keywords properly', function() {
        assert.equal(escape.keyword('test'), '"test"');
        assert.equal(escape.keyword('test with several words'), '"test with several words"');
        assert.equal(escape.keyword(), '""');
        assert.equal(escape.keyword('"test"'), '"\\"test\\""');
        assert.equal(escape.keyword("'test'"), '"\'test\'"');
      });
    });
    
    describe('string()', function() {
      it('should handle escaping strings properly', function() {
        assert.equal(escape.string('test'), "'test'");
        assert.equal(escape.string('test with several words'), "'test with several words'");
        assert.equal(escape.string(), "''");
        assert.equal(escape.string('"test"'), "'\"test\"'");
        assert.equal(escape.string("'test'"), "'\\'test\\''");
      });
    });
  });
});
