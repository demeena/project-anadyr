const socketIo = require('socket.io');
let io;

function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Новый клиент подключен');

    socket.on('disconnect', () => {
      console.log('Клиент отключен');
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io не инициализирован');
  }
  return io;
}

module.exports = { initSocket, getIo };
