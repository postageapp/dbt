// == Imports ===============================================================

let path = require('path');

let spawn = require('../support').spawn;

// == Functions =============================================================

function authArguments(options) {
  let args = [ ];

  if (options.username) {
    args.push('--user');
    args.push(options.username);
  }

  if (options.socket) {
    args.push('--socket');
    args.push(options.socket);
  }

  if (options.host) {
    args.push('--host');
    args.push(options.host);
  }

  if (options.port) {
    args.push('--port');
    args.push(options.port);
  }

  if (options.password) {
    // Specifying a MySQL password on the command-line must be done as a
    // single argument so it can be re-written by the process to xxxx
    args.push('--password=' + options.password);
  }

  return args;
}

function commonArguments() {
  return [
  ];
}

function restoreFromDump(dumpPath, options) {
  let mysql = spawn(
    'mysql',
    commonArguments().concat([
      dumpPath,
    ]),
    options
  );

  let psql = spawn(
    'psql',
    authArguments(options),
    options
  );

  mysql.stderr.on('data', function(data) {
    console.error(data.toString());
  });

  mysql.stdout.pipe(
    sqlRewriter(options)
  ).pipe(
    psql.stdin
  );

  psql.stderr.on('data', function(data) {
    console.error(data.toString());
  });

  return mysql.stderr;
}

function restoreFromSql(dumpPath, options) {
  let psql = spawn(
    'mysql',
    authArguments(options),
    options
  );

  fs.FileReadStream(dumpPath).pipe(
    // TODO
  )
}

function shell(options) {
  spawn(
    'mysql',
    authArguments(options).concat([
      '--database', options.database,
    ]),
    {
      inherit: true
    }
  );
}

function snapshotCreate(snapshotPath, options) {
  let mysqldump = spawn(
    'mysqldump',
    authArguments(options).concat(commonArguments()).concat([
      '--compress=9',
      '--file', snapshotFile,
      options.database
    ]),
    options
  );

  mysqldump.stderr.on('data', function(data) {
    console.error(data.toString())
  });

  return mysqldump.stderr;
}

function structureCreate(structureFile, options) {
  spawn(
    'mysqldump',
    authArguments(options).concat([
      '--ignore-version',
      '--schema-only',
      '--no-privileges',
      '--no-acl',
      '--no-owner',
      '--file', structureFile,
      options.database
    ]),
    options
  );
}

function snapshotRestore(snapshotFile) {
  switch (path.extname(snapshotFile))
  {
    // FUTURE: Add .sql.gz support
    case '.dump':
      restoreFromDump(snapshotFile, options);
      break;
    case '.sql':
      restoreFromSql(snapshotFile, options);
      break;
  }
}

function test(options, callback) {
  let shell = spawn(
    'mysql',
    authArguments(options),
    options
  );

  let error = false;

  shell.on('close', function(code) {
    if (!error) {
      callback(null, code);
    }
  });

  shell.on('error', function(err) {
    error = err;

    callback(err);
  });

  shell.stdin.emit('end');
}

// == Exports ===============================================================

module.exports = {
  snapshotRestore: snapshotRestore,
  snapshotCreate: snapshotCreate,
  structureCreate: structureCreate,
  shell: shell,
  test: test
};
