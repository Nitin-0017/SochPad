const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth');

// Get today's schedule
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const schedule = await Schedule.findOne({ user: req.user.id, date: today });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save or update a schedule
router.post('/', auth, async (req, res) => {
  const { blocks } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  try {
    let schedule = await Schedule.findOne({ user: req.user.id, date: today });
    
    if (schedule) {
      schedule.blocks = blocks;
      await schedule.save();
    } else {
      schedule = new Schedule({
        user: req.user.id,
        date: today,
        blocks
      });
      await schedule.save();
    }
    
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
