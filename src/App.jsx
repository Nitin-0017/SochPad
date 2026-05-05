import { useState, useEffect, useReducer } from 'react';
import './index.css';
import { storage, KEYS } from './utils/storage';
import { api } from './utils/api';

import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import Analytics from './components/Analytics';
import Schedule from './components/Schedule';
import AddTaskModal from './components/AddTaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import PlanDayModal from './components/PlanDayModal';
import SettingsModal from './components/SettingsModal';
import AIChat, { ChatBubble } from './components/AIChat';
import AuthModal from './components/AuthModal';

// ===== TASK REDUCER =====
function taskReducer(state, action) {
  switch (action.type) {
    case 'LOAD': return action.tasks.map(t => t.status === 'done' ? { ...t, subtasks: t.subtasks?.map(s => ({...s, done:true})) } : t);
    case 'ADD': return [action.task, ...state];
    case 'DELETE': return state.filter(t => t.id !== action.id || t._id !== action.id);
    case 'COMPLETE': return state.map(t => (t.id === action.id || t._id === action.id) ? { ...t, status:'done', subtasks: t.subtasks?.map(s => ({...s, done:true})) } : t);
    case 'MOVE': return state.map(t => {
      if (t.id === action.id || t._id === action.id) {
        if (action.status === 'done') {
           return { ...t, status: action.status, subtasks: t.subtasks?.map(s => ({...s, done:true})) };
        }
        return { ...t, status:action.status };
      }
      return t;
    });
    case 'SNOOZE': return state.map(t => (t.id === action.id || t._id === action.id)
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
    case 'UPDATE': return state.map(t => (t.id === action.id || t._id === action.id) ? { ...t, ...action.updates } : t);
    default: return state;
  }
}

import { Home, LayoutDashboard, BarChart2, CalendarDays as CalendarIcon, Flame, Plus, Settings, Key, X, Brain } from 'lucide-react';

// ===== NAV ITEMS =====
const NAV = [
  { id:'dashboard', label:'Home', icon: Home },
  { id:'board', label:'Board', icon: LayoutDashboard },
  { id:'schedule', label:'Schedule', icon: CalendarIcon },
  { id:'analytics', label:'Analytics', icon: BarChart2 },
];

export default function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const [streak, setStreak] = useState(0);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load from backend on mount
  useEffect(() => {
    const initApp = async () => {
      setAuthLoading(true);
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const backendTasks = await api.getTasks();
          dispatch({ type:'LOAD', tasks: backendTasks });
          try {
            const analytics = await api.getAnalytics();
            setStreak(analytics.streak || 0);
          } catch(e) {}
        }
      } catch (err) {
        console.error('Init failed', err);
      } finally {
        setAuthLoading(false);
      }
    };

    const savedPrefs = storage.get(KEYS.USER_PREFS, {});
    const savedMoodHistory = storage.get(KEYS.MOOD_HISTORY, []);

    initApp();
    setUserName(savedPrefs.name || '');
    setCurrentMood(savedPrefs.lastMood || '');
    setMoodHistory(savedMoodHistory);
  }, []);

  // We'll sync with backend in handlers instead of this effect
  // useEffect(() => {
  //   storage.set(KEYS.TASKS, tasks);
  // }, [tasks]);



  const handleAddTask = async (task) => {
    try {
      const savedTask = await api.createTask(task);
      dispatch({ type:'ADD', task: savedTask });
    } catch (err) {
      console.error('Failed to add task', err);
      dispatch({ type:'ADD', task }); // Fallback local
    }
  };

  const handleComplete = async (id) => {
    try {
      const task = tasks.find(t => t._id === id || t.id === id);
      const updatedSubtasks = task.subtasks?.map(s => ({ ...s, done: true }));
      const updates = { status: 'done' };
      if (updatedSubtasks) updates.subtasks = updatedSubtasks;
      await api.updateTask(id, updates);
      dispatch({ type:'COMPLETE', id });
      
      // Refresh streak from backend
      const analytics = await api.getAnalytics();
      setStreak(analytics.streak || 0);
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTask(id);
      dispatch({ type:'DELETE', id });
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleSnooze = async (id) => {
    const task = tasks.find(t => t._id === id || t.id === id);
    if (!task) return;
    const newSnoozeCount = (task.snooze_count || 0) + 1;
    try {
      await api.updateTask(id, { snooze_count: newSnoozeCount });
      dispatch({ type:'SNOOZE', id });
    } catch (err) {
      console.error('Failed to snooze task', err);
    }
  };

  const handleMove = async (id, status) => {
    try {
      const task = tasks.find(t => t._id === id || t.id === id);
      const updatedSubtasks = status === 'done' ? task.subtasks?.map(s => ({ ...s, done: true })) : undefined;
      const updates = { status };
      if (updatedSubtasks) updates.subtasks = updatedSubtasks;
      await api.updateTask(id, updates);
      dispatch({ type:'MOVE', id, status });
      if (status === 'done') {
        const analytics = await api.getAnalytics();
        setStreak(analytics.streak || 0);
      }
    } catch (err) {
      console.error('Failed to move task', err);
    }
  };

  const handleUpdateTask = async (id, updates) => {
    try {
      const updated = await api.updateTask(id, updates);
      dispatch({ type:'UPDATE', id, updates: updated });
      if (updates.status === 'done') {
        const analytics = await api.getAnalytics();
        setStreak(analytics.streak || 0);
      }
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleSaveSchedule = async (blocks) => {
    try {
      await api.saveSchedule(blocks);
      setShowPlan(false);
      setCurrentPage('schedule');
    } catch (err) {
      console.error('Failed to save schedule', err);
    }
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

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    dispatch({ type:'LOAD', tasks: [] });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    api.getTasks().then(tasks => dispatch({ type:'LOAD', tasks }));
    api.getAnalytics().then(a => setStreak(a.streak || 0));
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* TOP NAV - Responsive style */}
      <nav className="navbar">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:16 }}>
          <div style={{
            width:32, height:32,
            background:'linear-gradient(135deg, #FFF9C4, #FFE0B2)',
            borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 6px rgba(0,0,0,0.06)',
            color: '#E5A93D',
            flexShrink:0
          }}>
            <Brain size={18} />
          </div>
          <div className="logo-text">SochPad</div>
        </div>

        {/* Nav links */}
        <div className="nav-links">
          {NAV.map(n => {
            const active = currentPage === n.id;
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => setCurrentPage(n.id)}
                className={`nav-btn ${active ? 'active' : ''}`}
              >
                <Icon size={16} /> <span className="nav-label">{n.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex:1 }} />

        {/* Streak pill */}
        {streak > 0 && (
          <div className="streak-pill">
            <Flame size={14} style={{ animation:'fire 1.5s ease infinite', color: '#E5A93D' }} /> <span>Day {streak}</span>
          </div>
        )}

        {/* Add task */}
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
          style={{ padding:'8px 20px', fontSize:14, borderRadius:'50px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> <span className="btn-add-text">Add Task</span>
        </button>

        {/* Logout */}
        {currentUser && (
          <button
            onClick={handleLogout}
            className="btn-logout"
            style={{
              background:'rgba(220,50,50,0.05)', border:'none', color: '#C53030',
              borderRadius:50, padding:'8px 16px', cursor:'pointer',
              fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:13,
              transition:'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,50,50,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,50,50,0.05)'}
          >
            <span className="btn-logout-text">Log Out</span>
            <Key size={14} className="btn-logout-icon" style={{ display:'none' }} />
          </button>
        )}

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

      {/* AUTH MODAL */}
      {!currentUser && !authLoading && <AuthModal onLogin={handleLoginSuccess} />}

      {authLoading && (
        <div style={{ position:'fixed', inset:0, background:'white', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:'var(--text-mid)' }}>Connecting to SochPad...</p>
        </div>
      )}



      {/* MAIN CONTENT */}
      <main style={{ flex:1, maxWidth:1100, width:'100%', margin:'0 auto', padding:'32px 24px' }}>
        {currentPage === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            moodHistory={moodHistory}
            currentMood={currentMood}
            onMoodSet={handleMoodSet}
            onPlanDay={() => setShowPlan(true)}
            onAddClick={() => setShowAdd(true)}
            userName={userName}
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
        {currentPage === 'schedule' && (
          <Schedule onPlanDay={() => setShowPlan(true)} />
        )}
        {currentPage === 'analytics' && (
          <Analytics tasks={tasks} moodHistory={moodHistory} />
        )}
      </main>

      {/* MODALS */}
      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAddTask}
        />
      )}
      {expandedTask && (
        <TaskDetailModal
          task={expandedTask}
          onClose={() => setExpandedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={(id) => { handleDelete(id); setExpandedTask(null); }}
          onComplete={(id) => { handleComplete(id); setExpandedTask(null); }}
        />
      )}
      {showPlan && (
        <PlanDayModal
          tasks={tasks}
          currentMood={currentMood}
          onClose={() => setShowPlan(false)}
          onSave={handleSaveSchedule}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          userName={userName}
          onNameSave={handleSaveName}
        />
      )}

      {/* AI CHAT */}
      {showChat && <AIChat tasks={tasks} onClose={() => setShowChat(false)} />}
      <ChatBubble onClick={() => setShowChat(s => !s)} />
    </div>
  );
}
