import { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import loadingData from '../assets/Loading.json';

const TEXTS = [
  "Thinking...",
  "Organizing your thoughts...",
  "Finding your next step...",
  "One moment...",
];

export default function Loading() {
  const [textIndex, setTextIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Prevent flicker: only show if loading > 1.5s
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % TEXTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: 80, height: 80, opacity: 0.8 }}>
        <Player 
          src={loadingData} 
          loop 
          autoplay 
          speed={0.8}
        />
      </div>
      <p style={{
        marginTop: 16,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 14,
        color: 'var(--text-mid)',
        animation: 'fadeIn 0.5s ease',
      }}>
        {TEXTS[textIndex]}
      </p>
    </div>
  );
}
