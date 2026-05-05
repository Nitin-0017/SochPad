import { useState, useEffect, useRef } from 'react';
import { getGreeting } from '../utils/helpers';
import { getMoodSuggestion } from '../utils/ai';
import TaskCard from './TaskCard';
import { Player } from '@lottiefiles/react-lottie-player';
import owlData from '../assets/Owl.json';
import { PenLine, BrainCircuit, CalendarDays } from 'lucide-react';

export default function Dashboard({ tasks, onComplete, onDelete, onSnooze, onExpand, onAddClick, currentMood, onMoodSet, onPlanDay, userName }) {
  const greeting = getGreeting();
  const [companionThought, setCompanionThought] = useState('');
  const owlRef = useRef();

  const pendingTasks = tasks.filter(t => t.status !== 'done');

  // Find the single most important task
  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 2;
    const pb = priorityOrder[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  });

  const [suggestedTask, setSuggestedTask] = useState(null);
  const [suggestionReason, setSuggestionReason] = useState('');

  const primaryTask = suggestedTask || sortedTasks[0];
  const secondaryTasks = sortedTasks.filter(t => t.id !== primaryTask?.id).slice(0, 3); // Max 3 secondary tasks

  // Fetch mood suggestion when mood changes
  useEffect(() => {
    if (!currentMood || pendingTasks.length === 0) {
      setSuggestedTask(null);
      setSuggestionReason('');
      return;
    }

    getMoodSuggestion(currentMood, pendingTasks)
      .then(res => {
        const t = pendingTasks.find(x => x.id === res.task_id);
        if (t) {
          setSuggestedTask(t);
          setSuggestionReason(res.reason);
        }
      })
      .catch(() => { });
  }, [currentMood, tasks.length]);

  // Rotate companion thoughts based on tasks
  useEffect(() => {
    if (!primaryTask) {
      setCompanionThought("All clear for now. Enjoy the peace.");
      return;
    }

    if (suggestionReason) {
      setCompanionThought(suggestionReason);
    } else if (primaryTask.priority === 'URGENT') {
      setCompanionThought(`Let's tackle "${primaryTask.title}" first. You've got this.`);
    } else if (primaryTask.estimated_minutes) {
      setCompanionThought(`Start small. This one takes about ${primaryTask.estimated_minutes} mins.`);
    } else {
      setCompanionThought("One thing at a time. This is your focus for now.");
    }
  }, [primaryTask, suggestionReason]);

  const renderHeroGreeting = (subtext) => (
    <div style={{ textAlign: 'center', marginBottom: '56px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: 140, height: 140, cursor: 'pointer', marginBottom: '20px',
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.08))',
          animation: 'emptyNoteFloat 6s ease-in-out infinite alternate',
        }}
        onMouseEnter={() => owlRef.current?.setPlayerSpeed(1.2)}
        onMouseLeave={() => owlRef.current?.setPlayerSpeed(0.75)}
        onClick={() => {
          owlRef.current?.stop();
          owlRef.current?.play();
        }}
      >
        <Player
          ref={owlRef}
          src={owlData}
          loop
          autoplay
          speed={0.75}
        />
      </div>
      <h1 style={{
        fontFamily: "'Caveat',cursive", fontSize: 52, color: 'var(--text-dark)',
        fontWeight: 600, margin: '0 0 16px 0', textShadow: '0 2px 4px rgba(0,0,0,0.03)',
        lineHeight: 1.2
      }}>
        {greeting.text}{userName ? `, ${userName}` : ''}
      </h1>
      <p style={{
        color: 'var(--text-mid)', fontSize: 20,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        margin: 0, fontWeight: 500, letterSpacing: '-0.2px'
      }}>
        {subtext}
      </p>
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        minHeight: '70vh',
        justifyContent: 'center'
      }} className="animate-fade-in">

        {/* HERO SECTION */}
        {renderHeroGreeting("Your board is empty. That's a good start.")}

        {/* PRIMARY ACTION */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <button
            onClick={onAddClick}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(229,169,61,0.25)',
              animation: 'pulseGlow 2.5s infinite',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <PenLine size={18} /> Add your first thought
          </button>

          {/* AI GUIDANCE */}
          <div style={{
            marginTop: '24px',
            background: 'white',
            borderRadius: '20px',
            padding: '10px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(0,0,0,0.03)',
            color: 'var(--accent)'
          }}>
            <BrainCircuit size={18} />
            <span style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 16, color: 'var(--text-mid)' }}>
              Start small. Just one task.
            </span>
          </div>
        </div>

        {/* FADED BACKGROUND STICKY NOTES */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          transform: 'rotate(-4deg)',
          background: 'var(--note-yellow)',
          padding: '24px',
          width: '180px',
          height: '180px',
          borderRadius: '4px',
          opacity: 0.5,
          filter: 'blur(1.5px)',
          boxShadow: 'var(--shadow-note)',
          zIndex: 0,
          animation: 'emptyNoteFloat 6s ease-in-out infinite',
          '--note-rot': '-4deg'
        }}>
          <div className="push-pin pin-yellow" style={{ opacity: 0.7 }} />
          <p style={{ fontFamily: "'Caveat',cursive", fontSize: 24, color: 'var(--text-dark)', marginTop: 10 }}>Study for exam</p>
        </div>

        <div style={{
          position: 'absolute',
          top: '35%',
          right: '5%',
          transform: 'rotate(5deg)',
          background: 'var(--note-mint)',
          padding: '24px',
          width: '180px',
          height: '180px',
          borderRadius: '4px',
          opacity: 0.6,
          filter: 'blur(1px)',
          boxShadow: 'var(--shadow-note)',
          zIndex: 0,
          animation: 'emptyNoteFloat 7s ease-in-out infinite alternate',
          '--note-rot': '5deg',
          animationDelay: '1s'
        }}>
          <div className="push-pin pin-green" style={{ opacity: 0.7 }} />
          <p style={{ fontFamily: "'Caveat',cursive", fontSize: 24, color: 'var(--text-dark)', marginTop: 10 }}>Go for a walk</p>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '30%',
          transform: 'rotate(-2deg)',
          background: 'var(--note-peach)',
          padding: '24px',
          width: '160px',
          height: '160px',
          borderRadius: '4px',
          opacity: 0.4,
          filter: 'blur(2px)',
          boxShadow: 'var(--shadow-note)',
          zIndex: 0,
          animation: 'emptyNoteFloat 8s ease-in-out infinite',
          '--note-rot': '-2deg',
          animationDelay: '2s'
        }}>
          <div className="push-pin pin-red" style={{ opacity: 0.7 }} />
          <p style={{ fontFamily: "'Caveat',cursive", fontSize: 22, color: 'var(--text-dark)', marginTop: 10 }}>Call mom</p>
        </div>

      </div>
    );
  }

  return (
    <div style={{
      padding: '40px 0 80px',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '48px'
    }}>

      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', marginTop: '20px' }} className="animate-fade-in">
        {renderHeroGreeting(
          pendingTasks.length > 0
            ? `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''} today.`
            : "Your mind is clear. Add a thought when you're ready."
        )}

        {primaryTask && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: '-16px' }}>
            <button
              className="btn btn-primary"
              onClick={() => onExpand(primaryTask)}
              style={{
                padding: '14px 32px',
                fontSize: 16,
                borderRadius: '50px',
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                letterSpacing: '0.5px'
              }}
            >
              Start Your Focus Session
            </button>
            <button
              className="btn btn-ghost"
              onClick={onPlanDay}
              style={{
                padding: '14px 24px',
                fontSize: 16,
                borderRadius: '50px',
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <CalendarDays size={18} /> Plan My Day
            </button>
          </div>
        )}

        {/* Mood Selector */}
        {pendingTasks.length > 0 && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {['neutral', 'stressed', 'excited', 'anxious', 'overwhelmed'].map(m => (
              <button key={m} onClick={() => onMoodSet(m)} style={{
                background: currentMood === m ? 'var(--accent)' : 'white',
                color: currentMood === m ? 'white' : 'var(--text-mid)',
                border: currentMood === m ? '1px solid var(--accent)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 50, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans',sans-serif", textTransform: 'capitalize',
                transition: 'all 0.2s', boxShadow: currentMood === m ? '0 4px 10px rgba(229,169,61,0.3)' : 'none'
              }}>
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI COMPANION */}
      {companionThought && pendingTasks.length > 0 && (
        <div className="animate-fade-in" style={{
          display: 'flex', gap: 16, alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          maxWidth: '500px'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'white', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}>
            <BrainCircuit size={20} />
          </div>
          <div style={{
            background: 'white',
            borderRadius: '20px 20px 20px 4px',
            padding: '14px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)',
          }}>
            <p style={{
              fontSize: 15, color: 'var(--text-dark)',
              fontFamily: "'Patrick Hand',cursive",
              lineHeight: 1.4, letterSpacing: 0.3
            }}>
              {companionThought}
            </p>
          </div>
        </div>
      )}

      {/* PRIMARY TASK AREA */}
      {primaryTask && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-light)',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            Current Focus
          </div>

          <div style={{ transform: 'scale(1.1)', margin: '10px 0' }}>
            <TaskCard
              task={primaryTask}
              index={0}
              onComplete={onComplete}
              onDelete={onDelete}
              onSnooze={onSnooze}
              onExpand={onExpand}
            />
          </div>
        </div>
      )}

      {/* UP NEXT SECTION */}
      {secondaryTasks.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-light)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            Up Next
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            {secondaryTasks.map((t, i) => (
              <div key={t.id} style={{
                transform: 'scale(0.9)',
                opacity: 0.9,
                transition: 'opacity 0.3s ease, transform 0.3s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'scale(0.95)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = 'scale(0.9)'; }}
              >
                <TaskCard
                  task={t}
                  index={i + 1}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onSnooze={onSnooze}
                  onExpand={onExpand}
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
