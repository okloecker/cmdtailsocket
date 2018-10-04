const parse = require('date-fns/parse')
const { onExit } = require('@rauschma/stringio');
const { chunksToLinesAsync, chomp } = require('@rauschma/stringio');

const { spawn } = require('child_process');

const command = 'journalctl';
const args = ['-n2', '-ojson', '-f'];

async function main() {
  const source = spawn(command, args, {
    stdio: ['ignore', 'pipe', process.stderr]
  });

  await echoReadable(source.stdout);

  console.log('### DONE');
}

async function echoReadable(readable) {
  for await (const line of chunksToLinesAsync(readable)) {
    const logrec = chomp(line);
    const logrecJson = JSON.parse(logrec);
    const { __REALTIME_TIMESTAMP: timestamp, MESSAGE: msg } = logrecJson;
    console.log('LINE: ', parse(timestamp/1000), msg);
  }
}

main();
