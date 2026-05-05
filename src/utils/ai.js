import { api } from './api';

// This file now acts as a proxy to our backend AI routes
// This keeps our component logic the same while moving the actual API calls to the server

export async function callAI(messages, isJson = false) {
  // If we have a backend, we use it.
  return api.chat(messages);
}

export async function parseTask(userInput) {
  return api.parseTask(userInput);
}

export async function planDay(tasks, mood) {
  return api.planDay(tasks, mood);
}

export async function getProcrastinationInsight(task) {
  return api.getProcrastinationInsight(task);
}

export async function getMoodSuggestion(mood, tasks) {
  return api.getMoodSuggestion(mood, tasks);
}

export async function getWeeklyAnalysis(tasks, moodHistory) {
  return api.getWeeklyAnalysis(tasks, moodHistory);
}
