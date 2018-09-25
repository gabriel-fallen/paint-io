const restify = require('restify');
const socketIo = require('socket.io');

const server = restify.createServer();
const io = socketIo.listen(server.server);

server.get('/*', restify.plugins.serveStatic({
  directory: './client',
  default: 'index.html'
}));

let line_history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

  // first send the history to the new client
  line_history.forEach(line => {
    socket.emit('draw_line', line);
  });

  // add handler for message type "draw_line".
  socket.on('draw_line', function (data) {
    // add received line to history
    line_history.push(data);
    // send line to all clients
    io.emit('draw_line', data);
  });

  socket.on('clear_canvas', function () {
    line_history = [];
    io.emit('clear_canvas');
  });
});

server.listen(8000, () => {
  console.log('%s listening at %s', server.name, server.url);
});
