// == Imports ===============================================================

var child_process = require('child_process');
var path = require('path');

var sqlRewriter = require('./sql_rewriter');

// == Functions =============================================================

function spawn(exec, args, options) {
  if (options.log) {
    console.log('# ' + [ exec ].concat(args).join(' '));
  }

  return child_process.spawn(exec, args);
}

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
    authArguments(options),
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
  var kexec = require('kexec');

  kexec(
    'psql',
    authArguments(options).concat([
      '--dbname', options.database,
    ])
  );
}

function snapshotCreate(snapshotPath, options) {
  var pg_dump = spawn(
    'pg_dump',
    authArguments(options).concat(commonArguments()).concat([
      '--compress=9',
      '--file', snapshotFile,
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

function snapshotRestore(snapshotFile) {
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
    'psdql',
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
