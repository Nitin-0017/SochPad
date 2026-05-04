import { useState } from 'react';
import TaskCard from './TaskCard';
import { randomCompletionMsg } from '../utils/helpers';
import { PartyPopper, Sparkles, Target, Trophy, List, Zap, CheckCircle2 } from 'lucide-react';

const COLUMNS = [
  { key:'todo', label:'To Do', icon: List, accent:'#FFF9B1' },
  { key:'inprogress', label:'In Progress', icon: Zap, accent:'#DDD6FE' },
  { key:'done', label:'Done', icon: CheckCircle2, accent:'#C4F0DC' },
];

export default function TaskBoard({ tasks, onComplete, onDelete, onSnooze, onMove, onExpand }) {
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [toast, setToast] = useState('');

  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, colKey) => {
    e.preventDefault();
    if (dragId && colKey !== tasks.find(t=>t.id===dragId)?.status) {
      onMove(dragId, colKey);
      if (colKey === 'done') {
        setToast(randomCompletionMsg());
        setTimeout(() => setToast(''), 2500);
      }
    }
    setDragId(null);
    setDragOver(null);
  };

  const getColumnTasks = (colKey) => tasks.filter(t => t.status === colKey);

  const handleComplete = (id) => {
    setToast(randomCompletionMsg());
    setTimeout(() => setToast(''), 2500);
    onComplete(id);
  };

  return (
    <div style={{ padding:'0 0 40px' }}>
      <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:28, marginBottom:24, color:'var(--text-dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>
        Task Board
      </h2>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:80, left:'50%', transform:'translateX(-50%)',
          background:'var(--text-dark)', color:'white',
          padding:'12px 28px',
          borderRadius:50, fontWeight:600, fontSize:14, zIndex:999,
          boxShadow:'0 8px 30px rgba(0,0,0,0.15)',
          animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          fontFamily:"'Plus Jakarta Sans', sans-serif", letterSpacing:0.5,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {toast} <PartyPopper size={16} color="#FAC775" />
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, alignItems:'start' }}>
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.key);
          const isDropTarget = dragId && dragOver === col.key;
          return (
            <div
              key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOver(col.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, col.key)}
              style={{
                minHeight:350, borderRadius:16, padding:'20px 16px',
                background: isDropTarget 
                  ? 'rgba(0,0,0,0.04)' 
                  : 'rgba(0,0,0,0.02)',
                border: isDropTarget 
                  ? '2px dashed rgba(0,0,0,0.15)' 
                  : '2px dashed transparent',
                transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isDropTarget ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {/* Column header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div style={{
                  fontWeight:700, fontSize:14, color:'var(--text-dark)',
                  display:'flex', alignItems:'center', gap:8,
                  fontFamily:"'Plus Jakarta Sans', sans-serif", letterSpacing:0.5,
                  textTransform: 'uppercase'
                }}>
                  <col.icon size={16} /> {col.label}
                </div>
                <span style={{
                  background: col.accent, borderRadius:50,
                  width:26, height:26, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:12, fontWeight:700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  color: 'var(--text-dark)',
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {colTasks.length === 0 ? (
                  <div style={{
                    textAlign:'center', padding:'40px 20px',
                    color:'var(--text-mid)',
                    fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:15,
                    lineHeight: 1.6,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                  }}>
                    {col.key === 'todo' ? <><Sparkles size={20} /> So fresh, so clean!</> :
                     col.key === 'inprogress' ? <><Target size={20} /> Drag a note here</> :
                     <><Trophy size={20} /> Complete something!</>}
                    <span style={{ fontSize:13, opacity:0.7 }}>
                      {col.key === 'todo' ? 'Nothing pinned here yet' :
                       col.key === 'inprogress' ? 'to start working on it' :
                       "You'll see it here"}
                    </span>
                  </div>
                ) : colTasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i + (col.key === 'inprogress' ? 5 : col.key === 'done' ? 10 : 0)}
                    onComplete={handleComplete}
                    onDelete={onDelete}
                    onSnooze={onSnooze}
                    onExpand={onExpand}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>

              {/* Drop hint */}
              {dragId && dragOver === col.key && (
                <div style={{
                  marginTop:14, padding:'14px', borderRadius:8,
                  border:'2px dashed rgba(255,255,255,0.5)', textAlign:'center',
                  color:'rgba(255,255,255,0.7)', fontSize:14, fontWeight:600,
                  fontFamily:"'Patrick Hand', cursive",
                  animation:'pulse 1s ease infinite',
                }}>
                  Drop here →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
