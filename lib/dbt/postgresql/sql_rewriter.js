// == Imports ===============================================================

const fs = require('fs');
const path = require('path');
const stream = require('stream');
const StringDecoder = require('string_decoder').StringDecoder;
const util = require('util');

const template = require('../template');

// == Support Functions =====================================================

function defaultBuffer(options) {
  let substitutions = {
    username: options.username || process.env.USER,
    database: options.database,
    encoding: options.encoding || 'UTF-8'
  };

  return template.render(template.load('postgresql/connect.sql'), substitutions) + "\n";
}

// == Exported Functions ====================================================

util.inherits(sqlRewriter, stream.Transform);

function sqlRewriter(options) {
  if (!(this instanceof(sqlRewriter))) {
    return new sqlRewriter(options);
  }

  stream.Transform.call(this, { });

  this._writableState.objectMode = false;
  this._readableState.objectMode = true;

  this._buffer = defaultBuffer(options);
  this._encoding = options.encoding || 'utf8';
  this._decoder = new StringDecoder(this._encoding);

  this._options = options;
  this._skip_schemas = options.skip_schemas || [ 'public' ];
  this._database = options.database;
}

sqlRewriter.prototype._transform_lines = function(lines) {
  let _this = this;

  lines.forEach(function(line) {
    let m;

    if (m = line.match(/^CREATE SCHEMA (\w+)/)) {
      // Ignore lines relevant to creating a schema that are always defined
      // by default.
      if (_this._skip_schemas.indexOf(m[1]) >= 0) {
        return;
      }
    }

    // Change the OWNER statements to reflect the username defined in the
    // options, not the original owner.
    line = line.replace(/^ALTER SCHEMA (\S+) OWNER TO "(\w+)"/, function(_, schema, owner) {
      return template.render('ALTER SCHEMA {{schema}} OWNER TO "{{owner}}"', {
        schema: schema,
        owner: _this._options.username
      });
    });

    _this.push(new Buffer(line + "\n", this._encoding));
  })
}

// Required _transform interface
sqlRewriter.prototype._transform = function(chunk, encoding, callback) {
  this._buffer += this._decoder.write(chunk);

  let lines = this._buffer.split(/\r?\n/);

  // Save last line as it may be potentially incomplete
  this._buffer = lines.pop();

  this._transform_lines(lines);

  callback();
}

// Required _flush interface
sqlRewriter.prototype._flush = function(callback) {
  this.push(new Buffer(this._buffer, this._encoding));

  callback();
}

module.exports = sqlRewriter;
