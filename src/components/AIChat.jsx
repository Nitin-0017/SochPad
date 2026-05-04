import { useState, useEffect, useRef } from 'react';
import { callAI } from '../utils/ai';
import { Bot, Send, X } from 'lucide-react';

const SUGGESTIONS = [
  "What should I do right now?",
  "I only have 20 minutes",
  "I'm feeling overwhelmed",
  "Why am I so behind?",
  "Give me a pep talk",
];

export default function AIChat({ tasks, apiKey, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey, I'm here. What's on your mind? I can help you sort through that board, or just listen.",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    if (!apiKey) {
      setMessages(prev => [...prev, { role:'assistant', content:"I need an API key to think! Add it in settings first" }]);
      return;
    }
    setInput('');
    const userMsg = { role:'user', content: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);

    const taskContext = tasks.slice(0,10).map(t =>
      `- ${t.title} (${t.priority}, ${t.status}, due: ${t.due_date || 'no date'}, snoozed: ${t.snooze_count}x)`
    ).join('\n');

    const contextualMsg = `[User's current tasks:\n${taskContext || 'No tasks yet'}\n]\n\nUser says: ${msg}`;
    const apiMessages = [
      ...messages.filter(m => m.role !== 'system').slice(-6),
      { role: 'user', content: contextualMsg },
    ];

    try {
      const reply = await callAI(apiMessages, apiKey, false);
      setMessages(prev => [...prev, { role:'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role:'assistant', content:`Oops, brain glitch. ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position:'fixed', right:20, bottom:90, width:370, maxHeight:'70vh',
      background:'#FFF8EC', borderRadius:20, 
      boxShadow:'0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.3)',
      display:'flex', flexDirection:'column', zIndex:900, animation:'slideIn 0.3s ease',
      overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        background:'rgba(255, 255, 255, 0.95)',
        backdropFilter:'blur(8px)',
        padding:'16px 20px',
        borderBottom:'1px solid rgba(0,0,0,0.04)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'var(--note-yellow)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 6px rgba(0,0,0,0.04)',
          }}>
            <Bot size={18} color="var(--accent-dark)" />
          </div>
          <div>
            <div style={{ fontWeight:700, color:'var(--text-dark)', fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>SochPad Assistant</div>
            <div style={{ fontSize:10, color:'var(--text-mid)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>always here</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:'rgba(0,0,0,0.04)', border:'none', borderRadius:50, width:28, height:28, color:'var(--text-dark)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={14} /></button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            animation:'fadeIn 0.3s ease',
          }}>
            <div style={{
              maxWidth:'82%', padding:'10px 14px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user'
                ? '#374151'
                : 'white',
              color: m.role === 'user' ? 'white' : 'var(--text-dark)',
              fontSize:14, lineHeight:1.55,
              boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
              fontFamily: m.role === 'assistant' ? "'Plus Jakarta Sans',sans-serif" : "'Plus Jakarta Sans',sans-serif",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex' }}>
            <div style={{
              padding:'10px 14px', borderRadius:'16px 16px 16px 4px',
              background:'white', display:'flex', gap:5, alignItems:'center',
              boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding:'0 16px 8px', display:'flex', flexWrap:'wrap', gap:6 }}>
          {SUGGESTIONS.slice(0,3).map(s => (
            <button key={s} onClick={() => send(s)} style={{
              background:'white', border:'1px solid rgba(0,0,0,0.08)',
              borderRadius:50, padding:'5px 11px', fontSize:11, cursor:'pointer',
              color:'var(--text-mid)', fontFamily:"'Plus Jakarta Sans',sans-serif",
              transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--note-yellow)'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:'12px 16px 16px', borderTop:'1px solid rgba(0,0,0,0.06)', background:'rgba(255,255,255,0.5)' }}>
        <div style={{ display:'flex', gap:8 }}>
          <input
            className="input-field"
            placeholder="Talk to me…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            style={{ flex:1, padding:'10px 14px', fontFamily:"'Patrick Hand',cursive", fontSize:16 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              background:'#374151', color:'white', border:'none',
              borderRadius:50, width:38, height:38, cursor:'pointer', fontSize:16,
              opacity: (!input.trim() || loading) ? 0.5 : 1,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 3px 10px rgba(0,0,0,0.08)',
              transition:'all 0.2s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChatBubble({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position:'fixed', right:24, bottom:24, width:56, height:56,
        background:'white',
        borderRadius:'50%', border:'1px solid rgba(0,0,0,0.05)', cursor:'pointer', fontSize:24,
        boxShadow:'0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        animation:'companionBob 4s ease-in-out infinite',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:901,
        transition:'transform 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <Bot size={28} color="var(--accent-dark)" />
    </button>
  );
}
