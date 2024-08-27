const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Get all items
// router.get('/', async (req, res) => {
//   try {
//     const items = await Item.find().populate('category_id');
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


router.get('/', async (req, res) => {
  const { category_id } = req.query;

  if (!category_id) {
    return res.status(400).json({ message: 'category_id query parameter is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(category_id)) {
    return res.status(400).json({ message: 'Invalid category_id format' });
  }

  const filter = { category_id: new mongoose.Types.ObjectId(category_id) };

  try {
    const items = await Item.find(filter);
    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found for the given category_id' });
    }
    res.json(items);
  } 
  catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }

});

// Get a single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category_id');
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new item
router.post('/', async (req, res) => {
  const { name, quantity, price, category_id } = req.body;
  try {
    const newItem = new Item({ name, quantity, price, category_id });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an item by ID
router.put('/:id', async (req, res) => {
  try {
    const itemId=req.params.id

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid Item Id format' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      req.body,
      { new: true }
    );
    
    if (updatedItem) {
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an item by ID
router.delete('/:id', async (req, res) => {
  try {
    const itemId=req.params.id

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid Item Id format' });
    }
    const deletedItem = await Item.findByIdAndDelete(itemId);
    
    if (deletedItem) {
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
