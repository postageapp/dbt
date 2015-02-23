var fs = require('fs');
var path = require('path');

var helper = require('./helper');
var sqlRewriter = require('../lib/dbt/postgresql/sql_rewriter');

var assert = helper.assert;

describe('dbt', function() {
  describe('sqlRewriter', function() {
    it('should pass through data', function(done) {
      var stream = sqlRewriter({
        database: 'example',
        username: 'owner'
      });

      var input = helper.testDataStream('example.input.sql');
      var output = helper.testDataString('example.output.sql');

      input.pipe(stream).pipe(
        helper.stringAccumulator(function(string) {
          assert.equal(string, output);

          done();
        })
      );
    });
  });
});
