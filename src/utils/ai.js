const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are SochPad's AI assistant — warm, witty, and slightly sassy but always caring. 
You help users manage tasks intelligently. You speak like a smart friend, not a corporate bot. 
Use casual language, light humor, and genuine encouragement. 
Never be harsh — roast gently, always with love. 
Respond in the same language the user writes in (Hindi, English, Hinglish — match their vibe).
Keep responses SHORT and punchy unless asked for detail.`;

export async function callAI(messages, apiKey, isJson = false) {
  // Convert generic role messages to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: contents,
  };

  if (isJson) {
    payload.generationConfig = { responseMimeType: "application/json" };
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

export async function parseTask(userInput, apiKey) {
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
  "subtasks": ["subtask 1", "subtask 2", "subtask 3"], // If the task is complex or takes >15 mins, automatically generate 2-4 logical subtasks
  "ai_tip": "one warm, helpful sentence about this task",
  "detected_emotion": "stressed" | "excited" | "neutral" | "anxious" | "overwhelmed"
}`;

  const text = await callAI([{ role: 'user', content: prompt }], apiKey, true);
  return JSON.parse(text);
}

export async function planDay(tasks, mood, apiKey) {
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

  const text = await callAI([{ role: 'user', content: prompt }], apiKey, true);
  return JSON.parse(text);
}

export async function getProcrastinationInsight(task, apiKey) {
  const prompt = `A user keeps avoiding this task: "${task.title}" (snoozed ${task.snooze_count} times, created ${task.created_at}, category: ${task.category}).
Give a funny-but-caring message + 1 actionable suggestion. Keep it short (2-3 sentences max).
${task.snooze_count >= 3 ? 'Use gentle roast mode — this has been going on too long!' : 'Be gentle and curious.'}`;

  return await callAI([{ role: 'user', content: prompt }], apiKey, false);
}

export async function getMoodSuggestion(mood, tasks, apiKey) {
  const taskList = tasks.slice(0, 8).map(t => `- ${t.title} (${t.priority})`).join('\n');
  const prompt = `User's current mood: ${mood}
Today's tasks:
${taskList}

Recommend the best task order for this mood + a short motivational message. Keep it super brief and warm.`;
  return await callAI([{ role: 'user', content: prompt }], apiKey, false);
}

export async function getWeeklyAnalysis(tasks, completions, apiKey) {
  const summary = {
    total: tasks.length,
    completed: completions.length,
    categories: {},
    snoozed: tasks.filter(t => t.snooze_count > 0).length,
  };
  tasks.forEach(t => { summary.categories[t.category] = (summary.categories[t.category]||0)+1; });
  
  const prompt = `Here's a user's task data summary for the week:
${JSON.stringify(summary, null, 2)}

Give 3 insights + their procrastination archetype + advice for next week.
Return ONLY valid JSON matching this exact format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "archetype": "archetype name",
  "archetype_desc": "one fun sentence",
  "advice": "advice for next week"
}`;

  const text = await callAI([{ role: 'user', content: prompt }], apiKey, true);
  return JSON.parse(text);
}
