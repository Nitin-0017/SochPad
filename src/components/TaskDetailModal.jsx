import { useState } from 'react';
import { getCategoryEmoji, formatDate, getPriorityColor } from '../utils/helpers';
import { getProcrastinationInsight } from '../utils/ai';
import { X, CalendarDays, Timer, Clock, Lightbulb, Bot, Check, BrainCircuit, Trash2 } from 'lucide-react';

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete, apiKey }) {
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [localTask, setLocalTask] = useState(task);
  const [note, setNote] = useState(task.notes || '');

  const updateSubtask = (i, done) => {
    const updated = { ...localTask };
    updated.subtasks = localTask.subtasks.map((s,si) => si===i ? {...s, done} : s);
    setLocalTask(updated);
    onUpdate(updated.id, { subtasks: updated.subtasks });
  };

  const saveNote = () => {
    onUpdate(localTask.id, { notes: note });
  };

  const fetchInsight = async () => {
    if (!apiKey) return;
    setLoadingInsight(true);
    try {
      const res = await getProcrastinationInsight(task, apiKey);
      setInsight(res);
    } catch {}
    setLoadingInsight(false);
  };

  const priorityColors = { URGENT:'#D94040', HIGH:'#C96B3A', MEDIUM:'#A87B00', LOW:'#2A7D63' };
  const priorityBg = { URGENT:'#FFE5E5', HIGH:'#FFF0E8', MEDIUM:'#FFF8E0', LOW:'#E5F9F4' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:640 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <span style={{ fontSize:12, color:'var(--text-light)', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              {getCategoryEmoji(task.category)} {task.category}
            </span>
            <h2 style={{ fontFamily:"'Caveat',cursive", fontSize:30, color:'var(--text-dark)', marginTop:4 }}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', alignSelf:'flex-start', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={20} /></button>
        </div>

        {/* Meta row */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
          <span style={{
            background: priorityBg[task.priority],
            color: priorityColors[task.priority],
            padding:'4px 12px', borderRadius:50, fontSize:12, fontWeight:600,
          }}>
            {task.priority}
          </span>
          {task.due_date && (
            <span style={{ background:'rgba(0,0,0,0.06)', padding:'4px 12px', borderRadius:50, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
              <CalendarDays size={14} /> {formatDate(task.due_date)} {task.due_time || ''}
            </span>
          )}
          {task.estimated_minutes && (
            <span style={{ background:'rgba(0,0,0,0.06)', padding:'4px 12px', borderRadius:50, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
              <Timer size={14} /> ~{task.estimated_minutes}min
            </span>
          )}
          {task.snooze_count > 0 && (
            <span style={{ background:'#FFF3D4', color:'#A87B00', padding:'4px 12px', borderRadius:50, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
              <Clock size={14} /> Snoozed {task.snooze_count}×
            </span>
          )}
        </div>

        {/* AI tip */}
        {task.ai_tip && (
          <div style={{
            background:'rgba(206,203,246,0.3)', borderRadius:12, padding:'10px 14px',
            marginBottom:20, fontSize:13, color:'var(--text-dark)', lineHeight:1.5, display:'flex', alignItems:'flex-start', gap:8
          }}>
            <span style={{ color:'#7B5EA7', marginTop:2 }}><Lightbulb size={16} /></span>
            <div>{task.ai_tip}</div>
          </div>
        )}

        {/* AI Mood tag */}
        {task.ai_mood_tag && (
          <div style={{
            background:'rgba(159,225,203,0.25)', borderRadius:12, padding:'8px 14px',
            marginBottom:20, fontSize:12, color:'var(--text-mid)', display:'flex', alignItems:'center', gap:6
          }}>
            <Bot size={16} /> {task.ai_mood_tag}
          </div>
        )}

        {/* Subtasks */}
        {localTask.subtasks?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'var(--text-light)', marginBottom:10 }}>SUBTASKS</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {localTask.subtasks.map((s,i) => (
                <div key={i} style={{
                  display:'flex', gap:10, alignItems:'center', padding:'10px 14px',
                  background: s.done ? 'rgba(159,225,203,0.2)' : '#F9F7F2',
                  borderRadius:10, cursor:'pointer',
                  transition:'background 0.2s',
                }} onClick={() => updateSubtask(i, !s.done)}>
                  <div style={{
                    width:20, height:20, borderRadius:50, border:'2px solid',
                    borderColor: s.done ? '#2A7D63' : 'rgba(0,0,0,0.2)',
                    background: s.done ? '#9FE1CB' : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, color:'#2A7D63', transition:'all 0.2s',
                  }}>
                    {s.done && <Check size={12} />}
                  </div>
                  <span style={{
                    fontSize:14, color:'var(--text-dark)',
                    textDecoration: s.done ? 'line-through' : 'none',
                    opacity: s.done ? 0.6 : 1,
                  }}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-light)', marginBottom:8 }}>NOTES</p>
          <textarea
            className="input-field"
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={saveNote}
            placeholder="Add notes here..."
            style={{ minHeight:80, fontSize:14 }}
          />
        </div>

        {/* Procrastination insight */}
        {task.snooze_count >= 2 && (
          <div style={{ marginBottom:20 }}>
            {!insight && !loadingInsight && (
              <button className="btn btn-ghost btn-sm" onClick={fetchInsight} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Bot size={14} /> Ask AI why I'm avoiding this
              </button>
            )}
            {loadingInsight && (
              <div style={{ display:'flex', gap:6, alignItems:'center', color:'var(--text-mid)', fontSize:13 }}>
                <span className="thinking-dot"/><span className="thinking-dot"/><span className="thinking-dot"/>
                <span style={{ marginLeft:6 }}>AI is judging you lovingly...</span>
              </div>
            )}
            {insight && (
              <div style={{
                background:'rgba(250,199,117,0.25)', border:'1.5px solid rgba(239,159,39,0.3)',
                borderRadius:12, padding:'12px 16px', fontSize:13, color:'var(--text-dark)',
                lineHeight:1.6, animation:'fadeIn 0.3s ease', display:'flex', alignItems:'flex-start', gap:8
              }}>
                <span style={{ color:'#E5A93D', marginTop:2 }}><BrainCircuit size={16} /></span>
                <div>{insight}</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { onDelete(task.id); onClose(); }} style={{ display:'flex', alignItems:'center', gap:6, color: '#D94040' }}>
            <Trash2 size={14} /> Delete
          </button>
          <div style={{ flex:1 }} />
          <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
