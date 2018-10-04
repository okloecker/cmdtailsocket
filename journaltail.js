'use strict';
const { spawn } = require('child_process');
const byline = require('byline');
const CBuffer = require('CBuffer');

function cmdtail(opts) {
  this._buffer = new CBuffer(opts.buflen || 0);

  console.log('cmdtail', JSON.stringify(opts));

  const journal = spawn(opts.command, opts.args, {
    stdio: ['ignore', 'pipe', process.stderr]
  });

  /*
  journal.stderr.on('data', data => {
    // If there is any important error then display it in the console. Tail will keep running.
    if (data.toString().indexOf('file truncated') === -1) {
      console.error(data.toString());
    }
  });
  */

  byline(journal.stdout).on('data', line => {
    const str = line.toString();
    this._buffer.push(str);
    opts.eventEmitter.emit('line', str);
    //console.log('LINE : ', str);
  });

  process.on('exit', () => {
    console.log(`Killing ${opts.command} `);
    journal.kill();
  });
}

module.exports = options => new cmdtail(options);
