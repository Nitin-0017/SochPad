import { useState, useEffect, useRef } from 'react';
import { getNoteColor, getNoteRotation, formatDate, isOverdue, isDueToday, getPriorityColor, getCategoryEmoji } from '../utils/helpers';
import { Circle, AlertTriangle, CalendarDays, Timer, Eye, Clock, Check, X as XIcon } from 'lucide-react';

const PIN_COLORS = ['pin-red','pin-yellow','pin-blue','pin-green'];
const PROCRASTINATION_MESSAGES = [
  { count: 2, msg: "You've been avoiding this one… want to start small?" },
  { count: 3, msg: "This one's been here a while. Maybe just the first step?" },
  { count: 4, msg: "At this point this task has a longer life than most of my houseplants." },
];

function ConfettiPiece({ style }) {
  return <div className="confetti-piece" style={style} />;
}

export default function TaskCard({ task, index, onComplete, onDelete, onSnooze, onExpand, onDragStart }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [wiggling, setWiggling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);

  const color = getNoteColor(index);
  const rotation = getNoteRotation(index);
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];
  const priorityClass = `priority-${getPriorityColor(task.priority)}`;
  const overdue = isOverdue(task.due_date);
  const dueToday = isDueToday(task.due_date);

  const procrastMsg = PROCRASTINATION_MESSAGES.find(p => task.snooze_count >= p.count);
  const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleComplete = (e) => {
    e.stopPropagation();
    setCompleting(true);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onComplete(task.id);
    }, 650);
  };

  const handleSnooze = (e) => {
    e.stopPropagation();
    setWiggling(true);
    setTimeout(() => setWiggling(false), 600);
    onSnooze(task.id);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    if (onDragStart) onDragStart(e, task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const confettiPieces = showConfetti ? Array.from({ length: 10 }).map((_, i) => ({
    left: `${5 + i * 9}%`,
    top: '10%',
    background: ['#FAC775','#F5C4B3','#9FE1CB','#EF9F27','#CECBF6','#E53E3E'][i % 6],
    animationDelay: `${i * 0.06}s`,
    animationDuration: `${0.5 + Math.random() * 0.5}s`,
    width: `${6 + Math.random() * 4}px`,
    height: `${6 + Math.random() * 4}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
  })) : [];

  return (
    <div
      ref={cardRef}
      className={`
        ${color} paper-fold
        ${completing ? 'animate-complete' : wiggling ? 'animate-wiggle' : 'animate-drop-in'}
        ${isDragging ? 'dragging' : ''}
      `}
      style={{
        '--note-rot': rotation,
        transform: `rotate(${rotation})`,
        position: 'relative',
        padding: '20px 16px 16px',
        borderRadius: '2px',
        boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow-note)',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'box-shadow 0.3s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        minWidth: '200px',
        maxWidth: '260px',
        userSelect: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        animation: completing 
          ? `noteComplete 0.65s cubic-bezier(0.55,0,1,0.45) forwards`
          : undefined,
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onExpand && onExpand(task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Confetti */}
      {confettiPieces.map((s, i) => <ConfettiPiece key={i} style={s} />)}

      {/* Push Pin */}
      <div className={`push-pin ${pinColor}`} />

      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8, marginTop: 4 }}>
        <span style={{ fontSize: 11, opacity: 0.65, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          {getCategoryEmoji(task.category)} {task.category}
        </span>
        <span className={`badge ${priorityClass}`} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          {task.priority === 'URGENT' ? <Circle fill="#C53030" color="#C53030" size={8} /> : 
           task.priority === 'HIGH' ? <Circle fill="#DD6B20" color="#DD6B20" size={8} /> : 
           task.priority === 'MEDIUM' ? <Circle fill="#D69E2E" color="#D69E2E" size={8} /> : 
           <Circle fill="#38A169" color="#38A169" size={8} />} 
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <p style={{
        fontFamily: "'Caveat', cursive",
        fontSize: 21,
        fontWeight: 600,
        color: 'var(--text-dark)',
        lineHeight: 1.3,
        marginBottom: 10,
        position: 'relative',
      }}>
        {task.title}
        {completing && <span style={{
          position:'absolute', left:0, top:'50%', height:3,
          background: 'rgba(0,0,0,0.5)', borderRadius:2,
          animation: 'strikethrough 0.3s ease forwards', width:'0%',
          transform: 'rotate(-1deg)',
        }} />}
      </p>

      {/* Due date */}
      {task.due_date && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 50, marginBottom: 8,
          background: overdue ? 'rgba(233,93,93,0.2)' : dueToday ? 'rgba(239,159,39,0.2)' : 'rgba(0,0,0,0.06)',
          color: overdue ? '#C53030' : dueToday ? '#975A16' : 'var(--text-mid)',
          fontSize: 11, fontWeight: 600,
        }}>
          {overdue ? <AlertTriangle size={12} /> : <CalendarDays size={12} />}
          {overdue ? 'This needed love yesterday…' : formatDate(task.due_date)}
          {task.due_time ? ` ${task.due_time}` : ''}
        </div>
      )}

      {/* Subtask progress */}
      {totalSubtasks > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 10, color:'var(--text-mid)' }}>Subtasks</span>
            <span style={{ fontSize: 10, fontWeight:700, color:'var(--text-mid)' }}>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div style={{ height:4, background:'rgba(0,0,0,0.08)', borderRadius:2, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:2,
              background: completedSubtasks === totalSubtasks ? '#48BB78' : 'var(--text-dark)',
              width: `${(completedSubtasks/totalSubtasks)*100}%`,
              transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
        </div>
      )}

      {/* Est time */}
      {task.estimated_minutes && (
        <span style={{ fontSize: 10, color:'var(--text-mid)', display:'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <Timer size={12} /> ~{task.estimated_minutes < 60 ? `${task.estimated_minutes}min` : `${Math.round(task.estimated_minutes/60)}h`}
        </span>
      )}

      {/* Procrastination flag */}
      {procrastMsg && (
        <div style={{
          fontSize: 11, background:'rgba(0,0,0,0.06)', borderRadius:8,
          padding:'6px 8px', marginBottom:8, color:'var(--text-dark)',
          fontFamily: "'Patrick Hand', cursive",
          fontStyle: 'normal', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <Eye size={14} /> {procrastMsg.msg}
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:5, marginTop:8, justifyContent:'flex-end' }}>
        {task.status !== 'done' && (
          <>
            <button onClick={handleSnooze} title="Snooze" style={{
              background:'rgba(0,0,0,0.06)', border:'none', borderRadius:50,
              width:26, height:26, cursor:'pointer', fontSize:11,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            ><Clock size={14} /></button>
            <button onClick={handleComplete} title="Complete" style={{
              background:'rgba(72,187,120,0.15)', border:'none', borderRadius:50,
              width:26, height:26, cursor:'pointer', fontSize:11,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s', color:'#2F855A',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(72,187,120,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(72,187,120,0.15)'}
            ><Check size={14} /></button>
          </>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} title="Delete" style={{
          background:'rgba(220,50,50,0.08)', border:'none', borderRadius:50,
          width:26, height:26, cursor:'pointer', fontSize:11,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#C53030', transition:'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,50,50,0.18)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,50,50,0.08)'}
        ><XIcon size={14} /></button>
      </div>
    </div>
  );
}
