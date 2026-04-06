const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all feedback (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit feedback (students)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.create({
      studentId: req.user.id,
      studentName: req.user.name,
      message: req.body.message
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete feedback (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
