import { useState } from 'react';
import { storage, KEYS } from '../utils/storage';
import { Settings as SettingsIcon, X, Key, Eye, EyeOff, BrainCircuit, Check, Trash2 } from 'lucide-react';

export default function SettingsModal({ apiKey, onSave, onClose, userName, onNameSave }) {
  const [key, setKey] = useState(apiKey || '');
  const [name, setName] = useState(userName || '');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSave(key.trim());
    onNameSave(name.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const handleClear = () => {
    if (confirm('Clear all SochPad data? This cannot be undone.')) {
      Object.values(KEYS).forEach(k => storage.remove(k));
      window.location.reload();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:480 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Caveat',cursive", fontSize:28, display:'flex', alignItems:'center', gap:8 }}><SettingsIcon size={24} color="var(--accent)" /> Settings</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={20} /></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'block', marginBottom:6 }}>
              YOUR NAME
            </label>
            <input
              className="input-field"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What should I call you?"
              style={{ fontFamily:"'Caveat',cursive", fontSize:20 }}
            />
          </div>

          {/* API Key */}
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-mid)', display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <Key size={14} /> GEMINI API KEY
            </label>
            <div style={{ position:'relative' }}>
              <input
                className="input-field"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{ paddingRight:50 }}
              />
              <button
                onClick={() => setShowKey(s => !s)}
                style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', display:'flex', alignItems:'center', justifyContent:'center'
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize:11, color:'var(--text-light)', marginTop:6, lineHeight:1.5 }}>
              Your key is stored locally in your browser only. Never sent anywhere except directly to Google Gemini.
              Get yours at <a href="https://aistudio.google.com" target="_blank" rel="noopener" style={{ color:'var(--accent)' }}>aistudio.google.com</a>
            </p>
          </div>

          {/* App info */}
          <div style={{
            background:'rgba(159,225,203,0.2)', borderRadius:12, padding:'12px 16px',
            fontSize:13, color:'var(--text-mid)', lineHeight:1.6,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}><BrainCircuit size={16} /> <strong>SochPad</strong> — your thinking buddy</div>
            All data is stored in your browser's localStorage. No accounts needed.
          </div>

          <button className="btn btn-primary" onClick={handleSave} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            {saved ? <><Check size={16} /> Saved!</> : 'Save Settings'}
          </button>

          <button
            onClick={handleClear}
            style={{
              background:'none', border:'1px solid #D94040', color:'#D94040',
              borderRadius:50, padding:'8px 16px', fontSize:12, cursor:'pointer',
              fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6
            }}
          >
            <Trash2 size={14} /> Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
