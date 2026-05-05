const mongoose = require('mongoose');

const scheduleBlockSchema = new mongoose.Schema({
  time: String,
  task: String,
  duration: Number,
  reason: String
});

const scheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  blocks: [scheduleBlockSchema]
}, { timestamps: true });

// Ensure one schedule per user per day
scheduleSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
