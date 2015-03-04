// == Imports ===============================================================

var path = require('path');

var spawn = require('../support').spawn;
var sqlRewriter = require('./sql_rewriter');

// == Functions =============================================================

function authArguments(options) {
  var args = [ ];

  if (options.username) {
    args.push('--username');
    args.push(options.username);
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
    process.env.PGPASSWORD = options.password;
  }

  return args;
}

function commonArguments() {
  return [
    '--format=custom',
    '--no-owner',
    '--no-privileges',
    '--no-security-labels',
    '--use-set-session-authorization'
  ];
}

function restoreFromDump(dumpPath, options) {
  var pg_restore = spawn(
    'pg_restore',
    commonArguments().concat([
      dumpPath,
    ]),
    options
  );

  var psql = spawn(
    'psql',
    authArguments(options).concat([
      '--dbname', 'postgres',
    ]),
    options
  );

  pg_restore.stderr.on('data', function(data) {
    console.error(data.toString());
  });

  pg_restore.stdout.pipe(
    sqlRewriter(options)
  ).pipe(
    psql.stdin
  );

  psql.stderr.on('data', function(data) {
    console.error(data.toString());
  });

  return pg_restore.stderr;
}

function restoreFromSql(dumpPath, options) {
  var psql = spawn(
    'psql',
    authArguments(options),
    options
  );

  fs.FileReadStream(dumpPath).pipe(
    // ...
  )
}

function shell(options) {
  var shellProc = spawn(
    'psql',
    authArguments(options).concat([
      '--dbname', options.database,
    ]),
    {
      inherit: true
    }
  );
}

function snapshotCreate(snapshotPath, options) {
  var pg_dump = spawn(
    'pg_dump',
    authArguments(options).concat(commonArguments()).concat([
      '--compress=9',
      '--file', snapshotPath,
      options.database
    ]),
    options
  );

  pg_dump.stderr.on('data', function(data) {
    console.error(data.toString())
  });

  return pg_dump.stderr;
}

function structureCreate(structureFile, options) {
  var pg_dump = spawn(
    'pg_dump',
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

function snapshotRestore(snapshotFile, options) {
  switch (path.extname(snapshotFile))
  {
    case '.dump':
      restoreFromDump(snapshotFile, options);
      break;
    case '.sql':
      restoreFromSql(snapshotFile, options);
      break;
  }
}

function test(options, callback) {
  var shell = spawn(
    'psql',
    authArguments(options),
    options
  );

  var error = false;

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
