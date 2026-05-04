import React from 'react';
import { BookOpen, Dumbbell, Briefcase, Users, Leaf, DollarSign, Pin } from 'lucide-react';

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
  if (h < 12) return { text: 'Good morning' };
  if (h < 17) return { text: 'Good afternoon' };
  if (h < 21) return { text: 'Good evening' };
  return { text: 'Hey night owl' };
}

export function getPriorityColor(priority) {
  const map = { URGENT: 'urgent', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
  return map[priority] || 'medium';
}

export function getCategoryEmoji(category) {
  const props = { size: 14 };
  const map = {
    Study: <BookOpen {...props} />, Health: <Dumbbell {...props} />, 
    Work: <Briefcase {...props} />, Social: <Users {...props} />,
    Personal: <Leaf {...props} />, Finance: <DollarSign {...props} />, 
    Other: <Pin {...props} />,
  };
  return map[category] || <Pin {...props} />;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function calcStreak(completions) {
  if (!completions?.length) return 0;
  const dates = [...new Set(completions.map(c => c.date))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let check = today;
  for (const d of dates) {
    if (d === check) {
      streak++;
      const next = new Date(check);
      next.setDate(next.getDate() - 1);
      check = next.toISOString().split('T')[0];
    } else break;
  }
  return streak;
}

export const COMPLETION_MESSAGES = [
  'Nailed it!', 'Look at you go!', 'One down, legend!',
  'Your future self thanks you', 'Crushed it!', 'Boom! Done!',
  'That\'s what I\'m talking about!', 'Level up!',
];

export function randomCompletionMsg() {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
}
