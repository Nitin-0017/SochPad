const express = require('express');
const router = express.Router();

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are SochPad's AI assistant — warm, witty, and slightly sassy but always caring. 
You help users manage tasks intelligently. You speak like a smart friend, not a corporate bot. 
Use casual language, light humor, and genuine encouragement. 
Never be harsh — roast gently, always with love. 
Respond in the same language the user writes in (Hindi, English, Hinglish — match their vibe).
Keep responses SHORT and punchy unless asked for detail.`;

async function callAI(messages, isJson = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API Key starts with:', apiKey ? apiKey.substring(0, 15) : 'NONE');
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in backend');

  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: contents,
  };

  if (isJson) {
    payload.generationConfig = { responseMimeType: "application/json" };
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from AI');
  return text;
}

// 1. Parse Task
router.post('/parse', async (req, res) => {
  try {
    const { userInput } = req.body;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

    const prompt = `User said: "${userInput}"
Today is ${dateStr}, time is ${timeStr}.

Parse this into a task. If the task is broad or complex (e.g., "presentation", "study", "project"), you MUST automatically generate 2-4 logical, actionable subtasks to help the user get started.
Return ONLY valid JSON matching this schema exactly:
{
  "title": "short clean task title",
  "due_date": "YYYY-MM-DD or null",
  "due_time": "HH:MM or null",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "category": "Study" | "Health" | "Work" | "Social" | "Personal" | "Finance" | "Other",
  "estimated_minutes": number,
  "subtasks": ["subtask 1", "subtask 2", "subtask 3"],
  "ai_tip": "one warm, helpful sentence about this task",
  "detected_emotion": "stressed" | "excited" | "neutral" | "anxious" | "overwhelmed"
}`;

    const text = await callAI([{ role: 'user', content: prompt }], true);
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('AI Parse Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 2. Plan Day
router.post('/plan', async (req, res) => {
  try {
    const { tasks, mood } = req.body;
    const taskList = tasks.map(t => `- ${t.title} (${t.priority}, ~${t.estimated_minutes}min, due: ${t.due_date || 'no date'})`).join('\n');
    const now = new Date();
    const prompt = `It's ${now.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}. User mood: ${mood}.
Pending tasks:
${taskList}

Create a smart time-blocked schedule for today. Consider priority, deadlines, mood, and estimated time.
Return ONLY a JSON array of time blocks (max 8 blocks), matching this exact format:
[
  { "time": "HH:MM", "task": "task title", "duration": minutes, "reason": "brief why" }
]
Max 8 blocks. Be realistic about what fits.`;

    const text = await callAI([{ role: 'user', content: prompt }], true);
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Procrastination Insight
router.post('/insight', async (req, res) => {
  try {
    const { task } = req.body;
    const prompt = `A user keeps avoiding this task: "${task.title}" (snoozed ${task.snooze_count} times, created ${task.createdAt}, category: ${task.category}).
Give a funny-but-caring message + 1 actionable suggestion. Keep it short (2-3 sentences max).
${task.snooze_count >= 3 ? 'Use gentle roast mode — this has been going on too long!' : 'Be gentle and curious.'}`;

    const text = await callAI([{ role: 'user', content: prompt }], false);
    res.json({ insight: text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Mood Suggestion
router.post('/suggest', async (req, res) => {
  try {
    const { mood, tasks } = req.body;
    const taskList = tasks.slice(0, 8).map(t => `- ${t.id} : ${t.title} (${t.priority})`).join('\n');
    const prompt = `User's current mood: ${mood}
Pending tasks:
${taskList}

Pick EXACTLY ONE task ID that best fits their mood.
Return ONLY valid JSON matching this exact schema:
{
  "task_id": "the task id",
  "reason": "1 short encouraging sentence why this task fits their mood perfectly right now"
}`;

    const text = await callAI([{ role: 'user', content: prompt }], true);
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Weekly Analysis
router.post('/analyze', async (req, res) => {
  try {
    const { tasks, moodHistory } = req.body;
    const prompt = `Analyze this week's data. 
Tasks: ${tasks.map(t => `- ${t.title} (Status: ${t.status}, Snoozed: ${t.snooze_count})`).join('\n')}
Moods: ${moodHistory.join(', ')}

Return ONLY JSON matching this schema:
{
  "archetype": "playful title",
  "archetype_desc": "short description",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "advice": "1 practical suggestion"
}`;

    const text = await callAI([{ role: 'user', content: prompt }], true);
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Chat
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const text = await callAI(messages, false);
    res.json({ reply: text });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
