const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coords: { type: [Number], required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'available' }, // "available" или "booked"
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Кто забронировал
  price: { type: Number, required: true }, // Цена
  rentalTime: { type: Number, default: null }, 
  bookingStartTime: { type: Date, default: null },
});

const Transport = mongoose.model('Transport', transportSchema);
module.exports = Transport;
