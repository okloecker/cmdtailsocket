var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const CmdTail = require('./cmdtail');
const parse = require('date-fns/parse');

const COMMAND = 'journalctl';
const BUFLEN = 12;
const ARGS = [`-n${BUFLEN || 0}`, '-o', 'json', '-f'];

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

const getRec = rec => ({
  unit: rec._SYSTEMD_UNIT,
  timestamp: rec.__REALTIME_TIMESTAMP,
  msg: rec.MESSAGE
});

io.on('connection', socket => {
  console.log('a user connected');
  journalLogger.getBuffer().forEach(line => {
    io.emit('logrecord', getRec(JSON.parse(line)));
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const journalLogger = new CmdTail({
  buflen: BUFLEN,
  command: COMMAND,
  args: ARGS
});

journalLogger.on('line', function(line, idx) {
  const logrecJson = JSON.parse(line.trim());
  const rec = getRec(logrecJson);
  console.log(
    `LINE[${idx}][${rec.unit}]`,
    parse(rec.timestamp / 1000),
    rec.msg
  );
  console.log(' buffer size:', this.getBuffer().length);

  io.emit('logrecord', rec);
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
