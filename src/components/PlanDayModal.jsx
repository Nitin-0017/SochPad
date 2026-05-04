import { useState } from 'react';
import { planDay } from '../utils/ai';
import Loading from './Loading';
import { CalendarDays, X, Sparkles, Timer, Check } from 'lucide-react';

export default function PlanDayModal({ tasks, currentMood, apiKey, onClose }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!apiKey) { setError('Need API key!'); return; }
    const pending = tasks.filter(t => t.status !== 'done');
    if (!pending.length) { setError("No tasks to plan! Add some first"); return; }
    setLoading(true);
    setError('');
    try {
      const result = await planDay(pending, currentMood || 'neutral', apiKey);
      setPlan(result);
    } catch (e) {
      setError("Couldn't plan today. " + e.message);
    }
    setLoading(false);
  };

  const HOUR_COLORS = ['#FAC775','#F5C4B3','#9FE1CB','#CECBF6','#F0997B','#FAC775','#F5C4B3','#9FE1CB'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:600 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Caveat',cursive", fontSize:30, display:'flex', alignItems:'center', gap:8 }}><CalendarDays size={26} color="var(--accent)" /> Plan My Day</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={20} /></button>
        </div>

        {!plan && !loading && (
          <>
            <p style={{ color:'var(--text-mid)', fontSize:14, marginBottom:20, lineHeight:1.6 }}>
              AI will create a smart time-blocked schedule using your {tasks.filter(t=>t.status!=='done').length} pending tasks, 
              considering your current mood ({currentMood || 'not set'}) and task priorities.
            </p>
            {error && <p style={{ color:'#D94040', fontSize:13, marginBottom:12 }}>{error}</p>}
            <button className="btn btn-primary" onClick={generate} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Sparkles size={16} /> Generate My Schedule
            </button>
          </>
        )}

        {loading && <Loading />}

        {plan && (
          <div className="animate-fade-in">
            <p style={{ fontSize:13, color:'var(--text-mid)', marginBottom:16 }}>
              Here's your optimized schedule for today
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:0, position:'relative' }}>
              {/* Timeline line */}
              <div style={{
                position:'absolute', left:52, top:0, bottom:0,
                width:2, background:'rgba(0,0,0,0.08)', borderRadius:1,
              }} />
              {plan.map((block, i) => (
                <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:16 }} className="animate-fade-in">
                  {/* Time */}
                  <div style={{
                    minWidth:48, textAlign:'right', paddingTop:6,
                    fontWeight:700, fontSize:13, color:'var(--accent)', zIndex:1,
                  }}>
                    {block.time}
                  </div>
                  {/* Dot */}
                  <div style={{
                    width:12, height:12, borderRadius:'50%', marginTop:8, flexShrink:0,
                    background: HOUR_COLORS[i % HOUR_COLORS.length],
                    border:'2px solid white', boxShadow:'0 0 0 2px rgba(0,0,0,0.1)',
                    zIndex:1,
                  }} />
                  {/* Block */}
                  <div style={{
                    flex:1, background: HOUR_COLORS[i % HOUR_COLORS.length] + '40',
                    borderRadius:12, padding:'10px 14px',
                    borderLeft:`3px solid ${HOUR_COLORS[i % HOUR_COLORS.length]}`,
                  }}>
                    <p style={{ fontFamily:"'Caveat',cursive", fontSize:18, fontWeight:600, marginBottom:2 }}>{block.task}</p>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:11, color:'var(--text-mid)', display:'flex', alignItems:'center', gap:4 }}><Timer size={12} /> {block.duration}min</span>
                      {block.reason && <span style={{ fontSize:11, color:'var(--text-light)', fontStyle:'italic' }}>· {block.reason}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, display:'flex', gap:10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setPlan(null); }}>↩ Regenerate</button>
              <button className="btn btn-primary btn-sm" onClick={onClose} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}><Check size={14} /> Looks good!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
