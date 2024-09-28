const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Подключаем модель пользователя
const router = express.Router();

// Маршрут для регистрации
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Возвращаем данные пользователя, включая _id, name, email
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршрут для авторизации
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Возвращаем токен, _id, name, email
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршрут для обновления профиля пользователя
router.put('/:id', async (req, res) => {
  const { id } = req.params; // Извлекаем id пользователя из параметров URL
  const { name, email, phone } = req.body; // Извлекаем новые данные профиля

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Обновляем поля профиля
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    const updatedUser = await user.save(); // Сохраняем изменения
    res.status(200).json(updatedUser); // Возвращаем обновленные данные
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Маршрут для обновления данных карты пользователя
router.put('/updateCard/:id', async (req, res) => {
  const { id } = req.params;
  const { cardNumber, cardExpiry, cardCvc, cardName } = req.body; // Добавляем cardName

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Обновляем данные карты, включая имя владельца
    user.cardDetails = {
      cardNumber,
      cardExpiry,
      cardCvc,
      cardName, // Добавляем имя владельца карты
    };

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении данных карты' });
  }
});

// Маршрут для получения данных пользователя по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user); // Возвращаем найденного пользователя
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
