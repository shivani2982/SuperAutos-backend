const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Item = require('../models/Item');

router.post('/add', async (req, res) => {
  try {
    const { item_id, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero' });
    }
  
    const item = await Item.findById(item_id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (quantity > item.quantity) {
      return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
    }

    let cartItem = await Cart.findOne({ item_id });
    if (cartItem) {
      if (cartItem.quantity + quantity > item.quantity) {
        return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
      }
      cartItem.quantity += quantity;
      cartItem.total_price = cartItem.quantity * item.price;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        item_id,
        quantity,
        total_price: quantity * item.price
      });
      await cartItem.save();
      // cartItem = await cartItem.populate('item_id').execPopulate();
      cartItem = await Cart.findById(cartItem._id).populate('item_id').exec();

    }

    item.quantity -= quantity;
    await item.save();

    res.status(200).json(cartItem);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ message: err.message });
  }
});

//get items in the cart
router.get('/', async (req, res) => {
    try {
      const cartItems = await Cart.find().populate('item_id');
      res.status(200).json(cartItems);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

//Update Cart Item Quantity
router.put('/:id', async (req, res) => {
    const { quantity } = req.body;
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }
  
    try {
      const cartItem = await Cart.findById(req.params.id).populate('item_id');
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
  
      const item = await Item.findById(cartItem.item_id._id);
      if (quantity > item.quantity) {
        return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
      }
  
      cartItem.quantity = quantity;
      cartItem.total_price = quantity * item.price;
      await cartItem.save();
  
      res.status(200).json(cartItem);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

//Remove item form cart
router.delete('/:id', async (req, res) => {
    try {
      const cartItem = await Cart.findById(req.params.id);
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
  
      const item = await Item.findById(cartItem.item_id);
      item.quantity += cartItem.quantity; // Restore item quantity
      await item.save(); // Save updated item quantity
  
      await Cart.findByIdAndDelete(cartItem); // Remove item from cart
  
      res.status(200).json({ message: 'Item removed from cart' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
// router.delete('/:id', async (req, res) => {
//     try {
//       await Cart.findByIdAndDelete(req.params.id);
//       res.status(200).json({ message: 'Item removed from cart' });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });
  
  

module.exports = router;
