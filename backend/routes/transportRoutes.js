const express = require('express');
const router = express.Router();
const Transport = require('../models/transportModel');
const { getIo } = require('../socket'); // Импортируем функцию для получения io

// Бронирование транспорта
router.post('/book/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // ID текущего пользователя

  try {
    const transport = await Transport.findById(id);
    if (!transport) {
      return res.status(404).json({ message: 'Транспортное средство не найдено' });
    }

    if (transport.status !== 'available') {
      return res.status(400).json({ message: 'Транспорт уже забронирован' });
    }

    transport.status = 'booked';
    transport.bookedBy = userId;
    await transport.save();

    // Получаем io и отправляем событие
    const io = getIo();
    io.emit('transportUpdated', transport);

    res.status(200).json({ message: 'Транспорт успешно забронирован', transport });
  } catch (error) {
    console.error('Ошибка при бронировании транспорта:', error);
    res.status(500).json({ message: 'Ошибка при бронировании транспорта' });
  }
});

// Отмена бронирования
router.post('/cancel/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // Получаем userId из тела запроса

  try {
    const transport = await Transport.findById(id);
    if (!transport) {
      return res.status(404).json({ message: 'Транспортное средство не найдено' });
    }

    // Проверяем, что транспорт забронирован этим пользователем
    if (transport.bookedBy && transport.bookedBy.toString() !== userId) {
      return res.status(400).json({ message: 'Вы не можете отменить это бронирование' });
    }

    transport.status = 'available';
    transport.bookedBy = null;
    await transport.save();

    // Получаем io и отправляем событие
    const io = getIo();
    io.emit('transportUpdated', transport);

    res.status(200).json({ message: 'Бронирование отменено', transport });
  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
    res.status(500).json({ message: 'Ошибка при отмене бронирования' });
  }
});

// Получение всех транспортных средств
router.get('/', async (req, res) => {
  try {
    const transports = await Transport.find({});
    res.status(200).json(transports);
  } catch (error) {
    console.error('Ошибка при получении транспортных средств:', error);
    res.status(500).json({ message: 'Ошибка при получении транспортных средств' });
  }
});

// Получение забронированного транспорта пользователем
router.get('/booked/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const bookedTransports = await Transport.find({ bookedBy: userId });
    res.status(200).json(bookedTransports);
  } catch (error) {
    console.error('Ошибка при получении забронированных транспортных средств:', error);
    res.status(500).json({ message: 'Ошибка при получении забронированных транспортных средств' });
  }
});

module.exports = router;
