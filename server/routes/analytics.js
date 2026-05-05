const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    
    const total = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done');
    const doneCount = doneTasks.length;
    const rate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    const now = new Date();
    
    // last7 and last30 based on updatedAt of done tasks
    const last7 = doneTasks.filter(t => {
      const d = new Date(t.updatedAt);
      const w = new Date(now); w.setDate(w.getDate() - 7);
      return d >= w;
    }).length;

    const last30 = doneTasks.filter(t => {
      const d = new Date(t.updatedAt);
      const m = new Date(now); m.setDate(m.getDate() - 30);
      return d >= m;
    }).length;

    // Categories
    const categories = {};
    tasks.forEach(t => {
      if (!categories[t.category]) categories[t.category] = { total: 0, done: 0 };
      categories[t.category].total++;
      if (t.status === 'done') categories[t.category].done++;
    });

    // Most avoided
    const mostAvoided = [...tasks]
      .filter(t => t.snooze_count > 0)
      .sort((a, b) => b.snooze_count - a.snooze_count)
      .slice(0, 3)
      .map(t => ({ id: t._id, title: t.title, category: t.category, snooze_count: t.snooze_count }));

    // Procrastination Score & Archetype
    const procrastinationScore = Math.min(100, tasks.reduce((acc, t) => acc + (t.snooze_count || 0) * 15, 0));
    
    let archetype = { label: 'Silent Achiever', desc: 'You just do it. Quietly dominant.' };
    if (procrastinationScore >= 20 && procrastinationScore < 50) archetype = { label: 'Last-Minute Legend', desc: 'You thrive under pressure. Chaotic but effective.' };
    else if (procrastinationScore >= 50 && procrastinationScore < 80) archetype = { label: 'Certified Overthinker', desc: "You've thought about doing it 10 times. That counts, right?" };
    else if (procrastinationScore >= 80) archetype = { label: 'The Ghost', desc: 'Your tasks have sent search parties. Please respond.' };

    // Streak calculation based on distinct dates of completed tasks
    const dates = [...new Set(doneTasks.map(t => new Date(t.updatedAt).toISOString().split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    
    // Check if they missed today, but maybe they did it yesterday. If yesterday is present, it's still a streak!
    // But standard calc: start from today. If today not present, check yesterday. If yesterday present, streak continues.
    
    let startIndex = 0;
    if (dates.length > 0 && dates[0] !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (dates[0] === yesterdayStr) {
        checkDate = yesterdayStr;
      }
    }

    for (const d of dates) {
      if (d === checkDate) {
        streak++;
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toISOString().split('T')[0];
      } else {
        // If we skipped a day, break the streak loop. 
        // Note: we already accounted for the "today or yesterday" start logic above.
        if (streak > 0 || checkDate !== today) break; 
      }
    }

    res.json({
      rate,
      last7,
      last30,
      categories,
      mostAvoided,
      procrastinationScore,
      archetype,
      streak
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
