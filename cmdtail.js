'use strict';
const EventEmitter = require('events').EventEmitter;
const { spawn } = require('child_process');
const byline = require('byline');
const CBuffer = require('CBuffer');

/*
 * Spawns a Linux command with parameters and captures its output in a ring buffer (CBuffer). Each line captured is also emitted as an Event with the key 'line'.
 */

class CmdTail extends EventEmitter {
  constructor(opts) {
    super();
    this._buffer = new CBuffer(opts.buflen || 0);
    this.journal = spawn(opts.command, opts.args, {
      stdio: ['ignore', 'pipe', process.stderr]
    });
    this.index = 0;

    byline(this.journal.stdout).on('data', line => {
      const str = line.toString().trim();
      this._buffer.push(str);
      this.emit('line', str, this.index++);
    });

    process.on('exit', () => {
      console.log(`Killing ${command} `);
      journal.kill();
    });
  }

  getBuffer() {
    return this._buffer.toArray();
  }

  /*
  journal.stderr.on('data', data => {
    // If there is any important error then display it in the console. Tail will keep running.
    if (data.toString().indexOf('file truncated') === -1) {
      console.error(data.toString());
    }
  });
  */
}

module.exports = CmdTail;
