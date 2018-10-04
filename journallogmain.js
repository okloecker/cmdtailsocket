const CmdTail = require('./cmdtail');
const parse = require('date-fns/parse');

const COMMAND = 'journalctl';
const BUFLEN = 8;
const ARGS = [`-n${BUFLEN || 0}`, '-ojson', '-f'];

main = () => {
  const journalLogger = new CmdTail({
    buflen: BUFLEN,
    command: COMMAND,
    args: ARGS
  });

  journalLogger.on('line', (line, idx) => {
    const logrec = line.trim();
    const logrecJson = JSON.parse(logrec);
    const { __REALTIME_TIMESTAMP: timestamp, MESSAGE: msg } = logrecJson;
    console.log(`LINE[${idx}]`, parse(timestamp / 1000), msg);

    /*
    const buffer = journalLogger.getBuffer();
    console.log('lines caputured:', buffer && buffer.length);
    */
  });
};

main();
