import { useState, useEffect } from 'react';
import { getWeeklyAnalysis } from '../utils/ai';
import { getCategoryEmoji } from '../utils/helpers';
import Loading from './Loading';
import { Trophy, Zap, Wind, Ghost, Eye, Clock, BrainCircuit, Lightbulb, Target, Book, Activity, Briefcase, Users, Leaf, DollarSign, Pin } from 'lucide-react';

function CategoryIcon({ category, size = 16 }) {
  const map = {
    Study: Book,
    Health: Activity,
    Work: Briefcase,
    Social: Users,
    Personal: Leaf,
    Finance: DollarSign,
    Other: Pin,
  };
  const Icon = map[category] || Pin;
  return <Icon size={size} />;
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? (value/max)*100 : 0;
  return (
    <div style={{ height:8, background:'rgba(0,0,0,0.06)', borderRadius:4, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width 0.8s ease' }} />
    </div>
  );
}

export default function Analytics({ tasks, moodHistory }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    import('../utils/api').then(({ api }) => {
      api.getAnalytics().then(res => {
        setData(res);
        setDataLoading(false);
      }).catch(err => {
        console.error(err);
        setDataLoading(false);
      });
    });
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await getWeeklyAnalysis(tasks, moodHistory);
      setAnalysis(res);
    } catch {}
    setLoading(false);
  };

  const CAT_COLORS = { Study:'#9FE1CB', Health:'#F0997B', Work:'#CECBF6', Social:'#FAC775', Personal:'#F5C4B3', Finance:'#FAC775', Other:'#d4c8a8' };

  if (dataLoading) {
    return <div style={{ padding:'40px', textAlign:'center' }}><Loading /></div>;
  }

  if (!data) return null;

  const { rate, last7, last30, categories, mostAvoided, procrastinationScore, archetype } = data;

  return (
    <div style={{ padding:'0 0 40px' }}>
      <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:28, marginBottom:24, color:'var(--text-dark)', fontWeight: 700, letterSpacing: '-0.5px' }}>
        Behavior Analytics
      </h2>

      {/* Top stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Completion Rate', value:`${rate}%`, sub:'all time', color:'var(--accent)' },
          { label:'Done (7 days)', value:last7, sub:'tasks completed', color:'#2A7D63' },
          { label:'Done (30 days)', value:last30, sub:'tasks completed', color:'#7B5EA7' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Caveat',cursive", fontSize:44, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontWeight:700, fontSize:13, color:'var(--text-dark)', marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:11, color:'var(--text-light)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Procrastination score */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-light)' }}>PROCRASTINATION SCORE</p>
          <span style={{ fontSize:20, display:'flex' }}>
            {archetype.label === 'Silent Achiever' ? <Trophy size={24} color="var(--accent)" /> : 
             archetype.label === 'Last-Minute Legend' ? <Zap size={24} color="var(--accent)" /> : 
             archetype.label === 'Certified Overthinker' ? <Wind size={24} color="var(--accent)" /> : 
             <Ghost size={24} color="var(--accent)" />}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <ProgressBar value={procrastinationScore} max={100} color={procrastinationScore > 70 ? '#D94040' : procrastinationScore > 40 ? '#EF9F27' : '#9FE1CB'} />
          </div>
          <span style={{ fontFamily:"'Caveat',cursive", fontSize:22, fontWeight:700 }}>{procrastinationScore}</span>
        </div>
        <div style={{ display:'inline-block', background:'rgba(239,159,39,0.15)', borderRadius:50, padding:'6px 14px' }}>
          <strong style={{ fontSize:14, color:'var(--text-dark)' }}>{archetype.label}</strong>
          <span style={{ fontSize:12, color:'var(--text-mid)', marginLeft:8 }}>{archetype.desc}</span>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(categories).length > 0 && (
        <div className="card" style={{ marginBottom:20 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-light)', marginBottom:14 }}>CATEGORY BREAKDOWN</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {Object.entries(categories).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.done/data.total)*100) : 0;
              return (
                <div key={cat}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                      <CategoryIcon category={cat} /> {cat}
                    </span>
                    <span style={{ fontSize:12, color:'var(--text-mid)' }}>{data.done}/{data.total} ({pct}%)</span>
                  </div>
                  <ProgressBar value={data.done} max={data.total} color={CAT_COLORS[cat] || '#FAC775'} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most avoided */}
      {mostAvoided.length > 0 && (
        <div className="card" style={{ marginBottom:20 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-light)', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}><Eye size={14} /> MOST AVOIDED</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {mostAvoided.map(t => (
              <div key={t.id} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'10px 14px', background:'rgba(250,199,117,0.2)', borderRadius:12,
                border:'1.5px solid rgba(239,159,39,0.3)',
              }}>
                <div>
                  <p style={{ fontFamily:"'Caveat',cursive", fontSize:18, fontWeight:600 }}>{t.title}</p>
                  <p style={{ fontSize:11, color:'var(--text-light)', display:'flex', alignItems:'center', gap:4 }}>
                    <CategoryIcon category={t.category} size={12} /> {t.category}
                  </p>
                </div>
                <span style={{
                  background:'#FFF3D4', color:'#A87B00', padding:'4px 10px',
                  borderRadius:50, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:4
                }}>
                  <Clock size={12} /> {t.snooze_count}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Weekly Analysis */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-light)', display:'flex', alignItems:'center', gap:6 }}><BrainCircuit size={14} /> AI WEEKLY ANALYSIS</p>
          {!analysis && (
            <button className="btn btn-primary btn-sm" onClick={fetchAnalysis} disabled={loading}>
              {loading ? 'Analyzing...' : 'Generate Report'}
            </button>
          )}
        </div>

        {loading && <Loading />}

        {analysis && (
          <div className="animate-fade-in">
            <div style={{
              background:'rgba(239,159,39,0.1)', borderRadius:12, padding:'12px 16px', marginBottom:16,
              border:'1.5px solid rgba(239,159,39,0.3)',
            }}>
              <p style={{ fontWeight:700, fontSize:16, display:'flex', alignItems:'center', gap:6 }}>{analysis.archetype} {analysis.archetype === 'Silent Achiever' ? <Trophy size={16}/> : analysis.archetype === 'Last-Minute Legend' ? <Zap size={16}/> : <Wind size={16}/>}</p>
              <p style={{ fontSize:13, color:'var(--text-mid)', marginTop:2 }}>{analysis.archetype_desc}</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              {analysis.insights?.map((ins, i) => (
                <div key={i} style={{
                  display:'flex', gap:10, padding:'10px 14px',
                  background:'#F9F7F2', borderRadius:10, alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize:16, color: '#E5A93D', marginTop: 2 }}><Lightbulb size={16} /></span>
                  <p style={{ fontSize:13, color:'var(--text-dark)', lineHeight:1.5 }}>{ins}</p>
                </div>
              ))}
            </div>
            {analysis.advice && (
              <div style={{
                background:'rgba(159,225,203,0.3)', borderRadius:12, padding:'12px 16px',
                fontSize:13, color:'var(--text-dark)', lineHeight:1.5, display:'flex', alignItems:'flex-start', gap:8
              }}>
                <span style={{ color: '#2A7D63', marginTop: 2 }}><Target size={16} /></span>
                <div><strong>Next week:</strong> {analysis.advice}</div>
              </div>
            )}
            <button className="btn btn-ghost btn-sm" style={{ marginTop:12 }} onClick={() => setAnalysis(null)}>↩ Regenerate</button>
          </div>
        )}

        {!analysis && !loading && (
          <p style={{ fontSize:13, color:'var(--text-light)', fontStyle:'italic' }}>
            Get AI insights about your productivity patterns, procrastination habits, and personalized advice.
          </p>
        )}
      </div>
    </div>
  );
}
