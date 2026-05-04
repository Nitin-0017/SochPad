import { useState } from 'react';
import { parseTask } from '../utils/ai';
import { generateId } from '../utils/helpers';
import Loading from './Loading';
import { BrainCircuit, X, Sparkles, Lightbulb, Timer, Pin } from 'lucide-react';

const LOADING_MSGS = [
  'Thinking really hard...',
  'Connecting neurons...',
  'Processing life choices...',
  'One sec, reading your mind...',
  'Untangling your thoughts...',
];

export default function AddTaskModal({ onClose, onAdd, apiKey }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [dotCount, setDotCount] = useState(0);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    if (!apiKey) { setError('Add your API key in settings first!'); return; }
    setLoading(true);
    setError('');
    setLoadingMsg(LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)]);
    const interval = setInterval(() => setDotCount(d => (d+1) % 4), 400);
    try {
      const result = await parseTask(input, apiKey);
      setParsed({
        ...result,
        subtasks: result.subtasks?.map(s => ({ text: s, done: false })) || [],
      });
    } catch (e) {
      setError("Oops, my brain glitched. Try again? 😅 (" + e.message + ")");
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  const handleConfirm = () => {
    const task = {
      id: generateId(),
      ...parsed,
      original_input: input,
      status: 'todo',
      snooze_count: 0,
      created_at: new Date().toISOString(),
      ai_mood_tag: getInitialMoodTag(parsed),
    };
    onAdd(task);
    onClose();
  };

  const getInitialMoodTag = (p) => {
    if (p?.detected_emotion === 'overwhelmed') return "Let's break this down together";
    if (p?.detected_emotion === 'stressed') return "Deep breath. One step at a time";
    if (p?.detected_emotion === 'excited') return "Love the energy! Let's go!";
    return "Fresh start, let's do this!";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Caveat', cursive", fontSize:28, color:'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={28} color="var(--accent)" /> What's on your mind?
          </h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={20} /></button>
        </div>

        {!parsed ? (
          <>
            <textarea
              className="input-field"
              placeholder={"Tell me anything...\n\n\"kal exam hai physics ka\"\n\"meet dentist sometime next week\"\n\"submit assignment before Friday 11pm\""}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
              style={{ minHeight: 120, fontFamily:"'Caveat', cursive", fontSize:20, marginBottom:16 }}
            />

            {error && <p style={{ color:'#D94040', fontSize:13, marginBottom:12 }}>{error}</p>}

            {loading ? (
              <Loading />
            ) : (
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ flex:1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Sparkles size={16} /> Let AI Parse This
                </button>
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              </div>
            )}
          </>
        ) : (
          <ParsedTaskForm parsed={parsed} setParsed={setParsed} onConfirm={handleConfirm} onBack={() => setParsed(null)} />
        )}
      </div>
    </div>
  );
}

function ParsedTaskForm({ parsed, setParsed, onConfirm, onBack }) {
  const update = (key, val) => setParsed(p => ({ ...p, [key]: val }));

  return (
    <div className="animate-fade-in">
      <div style={{
        background:'rgba(159,225,203,0.3)', borderRadius:12, padding:'10px 14px',
        marginBottom:16, fontSize:13, color:'var(--text-dark)', display:'flex', alignItems:'flex-start', gap:8
      }}>
        <span style={{ color:'#2A7D63', marginTop:1 }}><Lightbulb size={16} /></span>
        <div>{parsed.ai_tip}</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'block', marginBottom:4 }}>TITLE</label>
          <input className="input-field" value={parsed.title} onChange={e => update('title', e.target.value)}
            style={{ fontFamily:"'Caveat',cursive", fontSize:20 }} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'block', marginBottom:4 }}>DUE DATE</label>
            <input type="date" className="input-field" value={parsed.due_date || ''} onChange={e => update('due_date', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'block', marginBottom:4 }}>DUE TIME</label>
            <input type="time" className="input-field" value={parsed.due_time || ''} onChange={e => update('due_time', e.target.value)} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'block', marginBottom:4 }}>PRIORITY</label>
            <select className="input-field" value={parsed.priority} onChange={e => update('priority', e.target.value)}>
              {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'block', marginBottom:4 }}>CATEGORY</label>
            <select className="input-field" value={parsed.category} onChange={e => update('category', e.target.value)}>
              {['Study','Health','Work','Social','Personal','Finance','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'flex', alignItems:'center', gap:4, marginBottom:4 }}>
            <Timer size={12} /> ESTIMATED TIME (minutes)
          </label>
          <input type="number" className="input-field" value={parsed.estimated_minutes || ''} onChange={e => update('estimated_minutes', parseInt(e.target.value))} min={5} max={480} />
        </div>

        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'block', marginBottom:6 }}>SUBTASKS</label>
          {parsed.subtasks?.map((s, i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
              <input
                className="input-field"
                value={s.text}
                onChange={e => {
                  const updated = [...parsed.subtasks];
                  updated[i] = { ...updated[i], text: e.target.value };
                  setParsed(p => ({ ...p, subtasks: updated }));
                }}
                style={{ flex:1, padding:'8px 12px' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:10, marginTop:20 }}>
        <button className="btn btn-primary" onClick={onConfirm} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <Pin size={16} /> Add to Board!
        </button>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}
