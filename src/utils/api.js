const API_BASE = 'https://sochpad.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('sochpad_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'x-auth-token': token })
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('sochpad_token', data.token);
    return data;
  },
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('sochpad_token', data.token);
    return data;
  },
  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/user`, { headers: getHeaders() });
    if (!res.ok) return null;
    return res.json();
  },
  logout: () => {
    localStorage.removeItem('sochpad_token');
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Schedules
  getTodaySchedule: async () => {
    const res = await fetch(`${API_BASE}/schedules/today`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
  },
  saveSchedule: async (blocks) => {
    const res = await fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ blocks }),
    });
    if (!res.ok) throw new Error('Failed to save schedule');
    return res.json();
  },

  // Tasks
  getTasks: async () => {
    const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },
  createTask: async (task) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task),
    });
    return res.json();
  },
  updateTask: async (id, updates) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // AI Features (Backend Proxied)
  parseTask: async (userInput) => {
    const res = await fetch(`${API_BASE}/ai/parse`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userInput }),
    });
    if (!res.ok) throw new Error('AI Parsing failed');
    return res.json();
  },
  planDay: async (tasks, mood) => {
    const res = await fetch(`${API_BASE}/ai/plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tasks, mood }),
    });
    if (!res.ok) throw new Error('AI Planning failed');
    return res.json();
  },
  getProcrastinationInsight: async (task) => {
    const res = await fetch(`${API_BASE}/ai/insight`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ task }),
    });
    if (!res.ok) throw new Error('AI Insight failed');
    const data = await res.json();
    return data.insight;
  },
  getMoodSuggestion: async (mood, tasks) => {
    const res = await fetch(`${API_BASE}/ai/suggest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mood, tasks }),
    });
    if (!res.ok) throw new Error('AI Suggestion failed');
    return res.json();
  },
  getWeeklyAnalysis: async (tasks, moodHistory) => {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tasks, moodHistory }),
    });
    if (!res.ok) throw new Error('AI Analysis failed');
    return res.json();
  },
  chat: async (messages) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error('AI Chat failed');
    const data = await res.json();
    return data.reply;
  }
};
