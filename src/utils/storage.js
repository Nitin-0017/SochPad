const PREFIX = 'sochpad_';

export const storage = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
    catch (e) { console.error('storage.set error', e); }
  },
  remove: (key) => localStorage.removeItem(PREFIX + key),
};

export const KEYS = {
  TASKS: 'tasks',
  MOOD_HISTORY: 'mood_history',
  CHAT_HISTORY: 'chat_history',
  USER_PREFS: 'user_prefs',
  STREAK: 'streak',
  COMPLETIONS: 'completions',
  API_KEY: 'api_key',
};
