import { useState } from 'react';
import { api } from '../utils/api';
import { LogIn, UserPlus, Mail, Lock, User, Brain } from 'lucide-react';

export default function AuthModal({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await api.login(email, password);
      } else {
        data = await api.register(name, email, password);
      }
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white', width: '100%', maxWidth: '400px',
        borderRadius: '32px', padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #FFF9C4, #FFE0B2)',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(229,169,61,0.2)',
          color: '#E5A93D'
        }}>
          <Brain size={32} />
        </div>

        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--text-dark)' }}>
          {isLogin ? 'Welcome Back' : 'Join SochPad'}
        </h2>
        <p style={{ color: 'var(--text-mid)', marginBottom: 32, fontSize: 16 }}>
          {isLogin ? 'Your smart notes are waiting.' : 'Start your smart thinking journey.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input 
                type="text" placeholder="Full Name" required
                value={name} onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 15, background: 'rgba(0,0,0,0.01)' }}
              />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="email" placeholder="Email Address" required
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 15, background: 'rgba(0,0,0,0.01)' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="password" placeholder="Password" required
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 15, background: 'rgba(0,0,0,0.01)' }}
            />
          </div>

          {error && <p style={{ color: '#E53E3E', fontSize: 14, marginTop: 4 }}>{error}</p>}

          <button 
            type="submit" disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              color: 'white', border: 'none', borderRadius: 12, padding: '16px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 12,
              transition: 'transform 0.2s', boxShadow: '0 8px 24px rgba(229,169,61,0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 14, color: 'var(--text-mid)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
