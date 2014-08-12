// == Exported Functions ====================================================

function keyword(str) {
  if (typeof(str) == 'undefined') {
    str = '';
  }

  return '"' + str.replace(/\"/g, '\\"') + '"';
}

function string(str) {
  if (typeof(str) == 'undefined') {
    str = '';
  }

 return "'" + str.replace(/\'/g, "\\'") + "'";
}

// == Exports ===============================================================

module.exports = {
  keyword: keyword,
  string: string
};
