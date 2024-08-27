const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  customer_name: { type: String, required: true },
  discount: { type: Number, required: true },
  items: [
    {
      item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      quantity: { type: Number, required: true },
      total_price: { type: Number, required: true }
    }
  ],
  sub_total: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
