import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Loading from './Loading';
import { CalendarDays, Timer, Sparkles, RefreshCw, Clock } from 'lucide-react';

export default function Schedule({ onPlanDay }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await api.getTodaySchedule();
      setSchedule(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const HOUR_COLORS = ['#FAC775', '#F5C4B3', '#9FE1CB', '#CECBF6', '#F0997B', '#FAC775', '#F5C4B3', '#9FE1CB'];

  if (loading) return <div style={{ padding: 40 }}><Loading /></div>;

  return (
    <div style={{ padding: '0 0 40px', maxWidth: 650, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 28, color: 'var(--text-dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Daily Schedule
        </h2>
        {schedule && (
          <button className="btn btn-ghost btn-sm" onClick={onPlanDay} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Update
          </button>
        )}
      </div>

      {!schedule ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(0,0,0,0.02)', borderRadius: 24,
          border: '2px dashed rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: 60, height: 60, background: 'white', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)'
          }}>
            <CalendarDays size={30} color="var(--accent)" />
          </div>
          <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: 28, marginBottom: 10 }}>No plan for today yet?</h3>
          <p style={{ color: 'var(--text-mid)', fontSize: 15, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
            Let AI build an optimized schedule based on your current mood and priorities.
          </p>
          <button className="btn btn-primary" onClick={onPlanDay} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
            <Sparkles size={16} /> Plan My Day
          </button>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 52, top: 0, bottom: 0,
            width: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1,
          }} />

          {schedule.blocks.map((block, i) => (
            <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }} className="animate-fade-in">
              {/* Time */}
              <div style={{
                minWidth: 52, textAlign: 'right', paddingTop: 8,
                fontWeight: 700, fontSize: 14, color: 'var(--accent)', zIndex: 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                {block.time}
              </div>

              {/* Dot */}
              <div style={{
                width: 14, height: 14, borderRadius: '50%', marginTop: 10, flexShrink: 0,
                background: HOUR_COLORS[i % HOUR_COLORS.length],
                border: '3px solid white', boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
                zIndex: 1,
              }} />

              {/* Card */}
              <div style={{
                flex: 1, background: 'white',
                borderRadius: 16, padding: '16px 20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.04)',
                borderLeft: `5px solid ${HOUR_COLORS[i % HOUR_COLORS.length]}`,
                transition: 'transform 0.2s',
                cursor: 'default'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h4 style={{ fontFamily: "'Caveat',cursive", fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                    {block.task}
                  </h4>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px',
                    borderRadius: 50, background: HOUR_COLORS[i % HOUR_COLORS.length] + '20',
                    color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <Clock size={12} /> {block.duration}m
                  </span>
                </div>
                {block.reason && (
                  <p style={{
                    fontSize: 13, color: 'var(--text-mid)', margin: 0,
                    lineHeight: 1.5, fontStyle: 'italic'
                  }}>
                    {block.reason}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div style={{
            marginTop: 40, padding: '20px', borderRadius: 16,
            background: 'rgba(159,225,203,0.15)', border: '1px solid rgba(159,225,203,0.3)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              width: 36, height: 36, background: 'white', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Sparkles size={18} color="#2A7D63" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-dark)', margin: 0, lineHeight: 1.5 }}>
              <strong>AI Tip:</strong> This schedule is optimized for your current <strong>mood</strong> and task <strong>priorities</strong>. Focus on one block at a time!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
