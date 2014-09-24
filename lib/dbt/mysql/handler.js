// == Imports ===============================================================

var child_process = require('child_process');
var path = require('path');

// == Functions =============================================================

function spawn(exec, args, options) {
  if (options.log) {
    console.log('# ' + [ exec ].concat(args).join(' '));
  }

  return child_process.spawn(exec, args);
}

function exec(command, args, options) {
  var kexec = require('kexec');

  if (options.log) {
    console.log('# ' + [ command ].concat(args).join(' '));
  }

  return kexec(command, args);
}

function authArguments(options) {
  var args = [ ];

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
    args.push('--password=' + options.password);
  }

  return args;
}

function commonArguments() {
  return [
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
  exec(
    'mysql',
    authArguments(options).concat([
      '--database', options.database,
    ]),
    options
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
