export const NOTE_COLORS = ['note-yellow','note-peach','note-mint','note-lavender','note-coral'];
export const NOTE_ROTATIONS = ['-1.5deg','-1deg','0.5deg','1deg','1.5deg','2deg','-2deg'];

export function getNoteColor(index) {
  return NOTE_COLORS[index % NOTE_COLORS.length];
}
export function getNoteRotation(index) {
  return NOTE_ROTATIONS[index % NOTE_ROTATIONS.length];
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { month:'short', day:'numeric' });
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T23:59:59');
  return d < new Date();
}

export function isDueToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  return d >= today && d < tomorrow;
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  if (h < 21) return { text: 'Good evening', emoji: '🌙' };
  return { text: 'Hey night owl', emoji: '🦉' };
}

export function getPriorityColor(priority) {
  const map = { URGENT: 'urgent', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
  return map[priority] || 'medium';
}

export function getCategoryEmoji(category) {
  const map = {
    Study: '📚', Health: '💪', Work: '💼', Social: '👥',
    Personal: '🌱', Finance: '💰', Other: '📌',
  };
  return map[category] || '📌';
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function randomCompletionMsg() {
  const COMPLETION_MESSAGES = [
    'Nailed it! 🎯', 'Look at you go! ✨', 'One down, legend! 🏆',
    'Your future self thanks you 🙌', 'Crushed it! 💥', 'Boom! Done! 🚀',
    'That\'s what I\'m talking about! 🔥', 'Level up! ⬆️',
  ];
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
}
