const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const transportRoutes = require('./routes/transportRoutes');
const { initSocket } = require('./socket'); // Импортируем функцию инициализации сокета

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Подключено к MongoDB'))
.catch((err) => console.error('Ошибка подключения к MongoDB', err));

// Инициализируем Socket.IO
initSocket(server);

// Используем маршруты
app.use('/api/users', userRoutes);
app.use('/api/transports', transportRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = { app, server };
