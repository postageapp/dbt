// == Imports ===============================================================

// == Constants =============================================================

const aliases = {
  postgresql: [
    'postgis',
    'jdbc:postgresql',
    'postgres',
    'pg'
  ],
  mysql: [
    'jdbc:mysql',
    'mysql2'
  ]
};

const mappingTable = (() => {
  let m = { };

  for (const n in aliases) {
    aliases[n].forEach(a => m[a] = n);
  }

  return m;
})();

// == Exported Functions ====================================================

function mapping(adapter) {
  return mappingTable[adapter] || adapter;
}

// == Exports ===============================================================

module.exports = {
  mapping
};
