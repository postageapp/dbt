// == Imports ===============================================================

var fs = require('fs');
var path = require('path');

var escape = require('./escape');

// == Exported Functions ====================================================

function render(string, contents) {
  return string.replace(
    /(['"]?)\{\{(\w+)\}\}['"]?/g,
    function(s, q, v) {
      switch (q) {
        case '"':
          return escape.keyword(contents[v]);
        case "'":
          return escape.string(contents[v]);
        default:
          return contents[v];
      }
    }
  );
}

function load(name) {
  return fs.readFileSync(
    path.resolve(__dirname, '../../templates/' + name)
  ).toString();
}

// == Exports ===============================================================

module.exports = {
  render: render,
  load: load
};
