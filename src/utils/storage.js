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
  MOOD_HISTORY: 'mood_history',
  USER_PREFS: 'user_prefs',
};
