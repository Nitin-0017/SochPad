import { useState, useEffect, useReducer } from 'react';
import './index.css';
import { storage, KEYS } from './utils/storage';
import { calcStreak } from './utils/helpers';

import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import Analytics from './components/Analytics';
import AddTaskModal from './components/AddTaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import PlanDayModal from './components/PlanDayModal';
import SettingsModal from './components/SettingsModal';
import AIChat, { ChatBubble } from './components/AIChat';

// ===== TASK REDUCER =====
function taskReducer(state, action) {
  switch (action.type) {
    case 'LOAD': return action.tasks;
    case 'ADD': return [action.task, ...state];
    case 'DELETE': return state.filter(t => t.id !== action.id);
    case 'COMPLETE': return state.map(t => t.id === action.id ? { ...t, status:'done' } : t);
    case 'MOVE': return state.map(t => t.id === action.id ? { ...t, status:action.status } : t);
    case 'SNOOZE': return state.map(t => t.id === action.id
      ? {
          ...t,
          snooze_count: (t.snooze_count||0)+1,
          ai_mood_tag: (t.snooze_count||0)+1 >= 3
            ? "This one's been here a while… maybe just the first step?"
            : (t.snooze_count||0)+1 >= 2
            ? "You've been avoiding this one… want to start small?"
            : t.ai_mood_tag,
        }
      : t
    );
    case 'UPDATE': return state.map(t => t.id === action.id ? { ...t, ...action.updates } : t);
    default: return state;
  }
}

import { Home, LayoutDashboard, BarChart2, Flame, Plus, Settings, Key, X, Brain } from 'lucide-react';

// ===== NAV ITEMS =====
const NAV = [
  { id:'dashboard', label:'Home', icon: Home },
  { id:'board', label:'Board', icon: LayoutDashboard },
  { id:'analytics', label:'Analytics', icon: BarChart2 },
];

export default function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [completions, setCompletions] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [userName, setUserName] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [showApiPrompt, setShowApiPrompt] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const savedTasks = storage.get(KEYS.TASKS, []);
    const savedCompletions = storage.get(KEYS.COMPLETIONS, []);
    const savedPrefs = storage.get(KEYS.USER_PREFS, {});
    const savedMoodHistory = storage.get(KEYS.MOOD_HISTORY, []);
    const savedApiKey = storage.get(KEYS.API_KEY, '');

    dispatch({ type:'LOAD', tasks: savedTasks });
    setCompletions(savedCompletions);
    setUserName(savedPrefs.name || '');
    setCurrentMood(savedPrefs.lastMood || '');
    setMoodHistory(savedMoodHistory);
    setApiKey(savedApiKey);

    if (!savedApiKey) {
      setTimeout(() => setShowApiPrompt(true), 1500);
    }
  }, []);

  // Persist tasks
  useEffect(() => {
    storage.set(KEYS.TASKS, tasks);
  }, [tasks]);

  // Persist completions
  useEffect(() => {
    storage.set(KEYS.COMPLETIONS, completions);
  }, [completions]);

  const handleAddTask = (task) => {
    dispatch({ type:'ADD', task });
  };

  const handleComplete = (id) => {
    dispatch({ type:'COMPLETE', id });
    const today = new Date().toISOString().split('T')[0];
    setCompletions(prev => [...prev, { id, date: today, timestamp: new Date().toISOString() }]);
  };

  const handleDelete = (id) => {
    dispatch({ type:'DELETE', id });
  };

  const handleSnooze = (id) => {
    dispatch({ type:'SNOOZE', id });
  };

  const handleMove = (id, status) => {
    dispatch({ type:'MOVE', id, status });
    if (status === 'done') {
      const today = new Date().toISOString().split('T')[0];
      setCompletions(prev => [...prev, { id, date: today, timestamp: new Date().toISOString() }]);
    }
  };

  const handleUpdateTask = (id, updates) => {
    dispatch({ type:'UPDATE', id, updates });
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    storage.set(KEYS.API_KEY, key);
  };

  const handleSaveName = (name) => {
    setUserName(name);
    storage.set(KEYS.USER_PREFS, { name, lastMood: currentMood });
  };

  const handleMoodSet = (mood) => {
    setCurrentMood(mood);
    const entry = { mood, date: new Date().toISOString() };
    const updated = [...moodHistory, entry];
    setMoodHistory(updated);
    storage.set(KEYS.MOOD_HISTORY, updated);
    storage.set(KEYS.USER_PREFS, { name: userName, lastMood: mood });
  };

  const streak = calcStreak(completions);

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* TOP NAV - Minimal soft style */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(255, 255, 255, 0.85)',
        backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(0,0,0,0.04)',
        padding:'0 24px',
        display:'flex', alignItems:'center', gap:20, height:72,
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:16 }}>
          <div style={{
            width:32, height:32,
            background:'linear-gradient(135deg, #FFF9C4, #FFE0B2)',
            borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 6px rgba(0,0,0,0.06)',
            color: '#E5A93D'
          }}>
            <Brain size={18} />
          </div>
          <div>
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:20, fontWeight:700, color:'var(--text-dark)', lineHeight:1, letterSpacing:'-0.5px' }}>SochPad</div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display:'flex', gap:8 }}>
          {NAV.map(n => {
            const active = currentPage === n.id;
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => setCurrentPage(n.id)}
                style={{
                  background: active ? 'rgba(0,0,0,0.04)' : 'transparent',
                  border: 'none',
                  borderRadius:50,
                  padding:'8px 16px', cursor:'pointer',
                  fontFamily:"'Plus Jakarta Sans', sans-serif",
                  fontWeight:600, fontSize:14,
                  color: active ? 'var(--text-dark)' : 'var(--text-mid)',
                  transition:'all 0.2s',
                  display:'flex', alignItems:'center', gap:8,
                }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.color = 'var(--text-dark)'; }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.color = 'var(--text-mid)'; }}
              >
                <Icon size={16} /> {n.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex:1 }} />

        {/* Streak pill */}
        {streak > 0 && (
          <div style={{
            background:'rgba(229,169,61,0.1)', color:'var(--accent-dark)',
            borderRadius:50, padding:'6px 14px', fontSize:13, fontWeight:700,
            display:'flex', alignItems:'center', gap:6,
            fontFamily:"'Plus Jakarta Sans',sans-serif",
          }}>
            <Flame size={14} style={{ animation:'fire 1.5s ease infinite', color: '#E5A93D' }} /> Day {streak}
          </div>
        )}

        {/* Add task */}
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
          style={{ padding:'8px 20px', fontSize:14, borderRadius:'50px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Add Task
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background:'rgba(0,0,0,0.03)', border:'none', color: 'var(--text-dark)',
            borderRadius:50, width:38, height:38, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s',
          }}
          title="Settings"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
        >
          <Settings size={18} />
        </button>
      </nav>

      {/* API KEY PROMPT */}
      {showApiPrompt && !apiKey && (
        <div style={{
          background:'rgba(255,249,177,0.9)', backdropFilter:'blur(8px)',
          borderBottom:'2px solid rgba(212,134,26,0.3)',
          padding:'12px 24px',
          display:'flex', alignItems:'center', gap:12,
          animation:'slideUp 0.3s ease',
          boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <Key size={18} color="var(--accent)" />
          <p style={{ fontSize:15, color:'var(--text-dark)', flex:1, fontFamily:"'Plus Jakarta Sans',sans-serif", margin: 0 }}>
            Add your Gemini API key to unlock the thinking buddy — task parsing, day planning, mood coaching & more!
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowApiPrompt(false); setShowSettings(true); }}>
            Add Key
          </button>
          <button onClick={() => setShowApiPrompt(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{ flex:1, maxWidth:1100, width:'100%', margin:'0 auto', padding:'32px 24px' }}>
        {currentPage === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            completions={completions}
            moodHistory={moodHistory}
            currentMood={currentMood}
            onMoodSet={handleMoodSet}
            onPlanDay={() => setShowPlan(true)}
            onAddClick={() => setShowAdd(true)}
            apiKey={apiKey}
          />
        )}
        {currentPage === 'board' && (
          <TaskBoard
            tasks={tasks}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onSnooze={handleSnooze}
            onMove={handleMove}
            onExpand={setExpandedTask}
          />
        )}
        {currentPage === 'analytics' && (
          <Analytics tasks={tasks} completions={completions} apiKey={apiKey} />
        )}
      </main>

      {/* MODALS */}
      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAddTask}
          apiKey={apiKey}
        />
      )}
      {expandedTask && (
        <TaskDetailModal
          task={expandedTask}
          onClose={() => setExpandedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={(id) => { handleDelete(id); setExpandedTask(null); }}
          apiKey={apiKey}
        />
      )}
      {showPlan && (
        <PlanDayModal
          tasks={tasks}
          currentMood={currentMood}
          apiKey={apiKey}
          onClose={() => setShowPlan(false)}
        />
      )}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowSettings(false)}
          userName={userName}
          onNameSave={handleSaveName}
        />
      )}

      {/* AI CHAT */}
      {showChat && <AIChat tasks={tasks} apiKey={apiKey} onClose={() => setShowChat(false)} />}
      <ChatBubble onClick={() => setShowChat(s => !s)} />
    </div>
  );
}
