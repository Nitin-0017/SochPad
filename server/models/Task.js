const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  text: String,
  done: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  category: { type: String, default: 'Other' },
  due_date: { type: String, default: null }, // YYYY-MM-DD
  due_time: { type: String, default: null }, // HH:MM
  estimated_minutes: { type: Number, default: 0 },
  snooze_count: { type: Number, default: 0 },
  subtasks: [subtaskSchema],
  notes: { type: String, default: '' },
  ai_tip: { type: String, default: '' },
  ai_mood_tag: { type: String, default: '' },
  detected_emotion: { type: String, default: 'neutral' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
