// == Imports ===============================================================

const path = require('path');

const spawn = require('../support').spawn;
const sqlRewriter = require('./sql_rewriter');

// == Functions =============================================================

function authArguments(options) {
  let args = [ ];

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

function commonArguments(options) {
  let args = [
    '--format=custom',
    '--no-owner',
    '--no-privileges',
    '--no-security-labels',
    '--use-set-session-authorization'
  ];

  if (options.verbose) {
    args.push('--verbose');
  }

  return args;
}

function restoreFromDump(dumpPath, options) {
  let pg_restore = spawn(
    'pg_restore',
    commonArguments(options).concat([
      dumpPath
    ]),
    options
  );

  let psql = spawn(
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
  let psql = spawn(
    'psql',
    authArguments(options),
    options
  );

  fs.FileReadStream(dumpPath).pipe(
    // ...
  )
}

function shell(options) {
  let shellProc = spawn(
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
  let pg_dump = spawn(
    'pg_dump',
    authArguments(options).concat(commonArguments(options)).concat([
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
  let pg_dump = spawn(
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
  let shell = spawn(
    'psql',
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
