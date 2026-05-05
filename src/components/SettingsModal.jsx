import { useState } from 'react';
import { storage, KEYS } from '../utils/storage';
import { Settings as SettingsIcon, X, Key, Eye, EyeOff, BrainCircuit, Check, Trash2 } from 'lucide-react';

export default function SettingsModal({ onClose, userName, onNameSave }) {
  const [name, setName] = useState(userName || '');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
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
