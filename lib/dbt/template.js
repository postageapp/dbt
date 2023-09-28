// == Imports ===============================================================

const fs = require('fs');
const path = require('path');

const escape = require('./template/escape');

// == Exported Functions ====================================================

function render(string, contents) {
  return string.replace(
    /(['"]?)\{\{(\w+)\}\}['"]?/g,
    function(_s, q, v) {
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
