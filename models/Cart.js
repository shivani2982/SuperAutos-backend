const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: [0, 'Quantity cannot be negative'] },
  total_price: { type: Number, required: true }
});

module.exports = mongoose.model('Cart', cartSchema);
