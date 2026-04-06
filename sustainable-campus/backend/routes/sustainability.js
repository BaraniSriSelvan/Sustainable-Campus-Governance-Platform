const express = require('express');
const router = express.Router();
const Sustainability = require('../models/Sustainability');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get latest sustainability data (all users)
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const data = await Sustainability.findOne().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sustainability records (all users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const data = await Sustainability.find().sort({ createdAt: -1 }).limit(30);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new sustainability data (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { energyCurrent, energyMax, waterCurrent, waterMax, wasteRecycled, wasteTotal } = req.body;

    const entry = new Sustainability({
      energyCurrent, energyMax,
      waterCurrent, waterMax,
      wasteRecycled, wasteTotal,
      createdBy: req.user.id
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete sustainability entry (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Sustainability.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
