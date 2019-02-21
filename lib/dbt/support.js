const child_process = require('child_process');

function spawn(exec, args, options) {
  if (options && options.log) {
    console.log('# ' + [ exec ].concat(args).join(' '));
  }

  let spawnOptions = { };

  if (options && options.inherit) {
    spawnOptions.stdio = 'inherit';
  }

  return child_process.spawn(exec, args, spawnOptions);
}

module.exports = {
  spawn: spawn
};
