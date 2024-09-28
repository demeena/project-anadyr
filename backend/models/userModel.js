const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  cardDetails: { // Добавляем схему для карты
    cardNumber: { type: String },
    cardExpiry: { type: String },
    cardCvc: { type: String },
    cardName: { type: String } // Добавляем поле для имени владельца карты
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
