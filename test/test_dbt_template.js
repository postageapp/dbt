var fs = require('fs');
var path = require('path');

var helper = require('./helper');
var template = require('../lib/dbt/template');

var assert = helper.assert;

describe('dbt', function() {
  describe('template', function() {
    describe('load()', function() {
      it('should load in a given template', function() {
        var loaded = template.load('postgresql/connect.sql');

        assert.ok(loaded);

        assert.equal(typeof(loaded), 'string');
      });
    });
  });
});
