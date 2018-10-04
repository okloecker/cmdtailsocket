const cmdtail = require('./journaltail');
const EventEmitter = require('events').EventEmitter;
const parse = require('date-fns/parse')

const COMMAND = 'journalctl';
const BUFLEN = 2;
const ARGS = [`-n${BUFLEN || 0}`, '-ojson', '-f'];

class LineEmitter extends EventEmitter {}

const logEmitter = new LineEmitter();
logEmitter.on('line', line => {
    const logrec = line.trim();
    const logrecJson = JSON.parse(logrec);
    const { __REALTIME_TIMESTAMP: timestamp, MESSAGE: msg } = logrecJson;
    console.log('LINE: ', parse(timestamp/1000), msg);
});

main = () => {
  cmdtail({
    buflen: BUFLEN,
    command: COMMAND,
    args: ARGS,
    eventEmitter: logEmitter, 
  });
};

main();
