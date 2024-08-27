// routes/bill.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Bill = require('../models/Bill');
const Item = require('../models/Item');

router.post('/generate-bill', async (req, res) => {
  const { customer_name, discount } = req.body;

  try {
    const cartItems = await Cart.find().populate('item_id');

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    // Calculate sub-total and total amount after discount
    const subTotal = cartItems.reduce((total, item) => total + item.total_price, 0);
    const totalAmount = subTotal - discount;

    // Create a new bill
    const bill = new Bill({
      customer_name,
      discount,
      items: cartItems,
      sub_total: subTotal,
      total_amount: totalAmount
    });

    // Save the bill in the database
    await bill.save();

    // Clear the cart after bill generation
    await Cart.deleteMany({});

    // Return the generated bill as a response
    res.status(200).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:billId', async (req, res) => {
  const { billId } = req.params;

  try {
    const bill = await Bill.findById(billId).populate('items.item_id');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.status(200).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
