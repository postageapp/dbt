var chai = require('chai');
var fs = require('fs');
var path = require('path');
var stream = require('stream');
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;

function testDataStream(name) {
  return fs.createReadStream(path.resolve(__dirname, './data/' + name));
}

function testDataString(name) {
  return fs.readFileSync(path.resolve(__dirname, './data/' + name)).toString();
}

util.inherits(stringAccumulator, stream.Writable);

function stringAccumulator(callback, options) {
  if (!(this instanceof stringAccumulator)) {
    return new stringAccumulator(callback, options);
  }

  this._callback = callback;

  stream.Writable.call(this, { });

  this._writableState.objectMode = false;

  this._buffer = '';
  this._encoding = options && options.encoding || 'utf8';
  this._decoder = new StringDecoder(this._encoding);

  var _this = this;

  this.on('finish', function() {
    _this._callback(_this._buffer);
  })
}

stringAccumulator.prototype._write = function(chunk, encoding, callback) {
  this._buffer += this._decoder.write(chunk);

  callback();
}

module.exports = {
  assert: chai.assert,
  testDataStream: testDataStream,
  testDataString: testDataString,
  stringAccumulator: stringAccumulator
}
