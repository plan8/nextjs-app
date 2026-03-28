'use client';
import { useState } from 'react';

const SHOTS = [
  { name: 'The Butterfly', diff: 2, desc: 'Split the rack with cue ball going off two rails to pocket a ball in the opposite corner.', tip: 'Use follow (top spin) and aim for the second diamond on the long rail.' },
  { name: 'The Jump Shot', diff: 3, desc: 'Jump the cue ball over an obstacle ball to pocket your target.', tip: 'Elevate your cue to about 45 degrees and strike down on the cue ball firmly.' },
  { name: 'The Masse', diff: 4, desc: 'Curve the cue ball around an obstacle using extreme spin.', tip: 'Hold the cue nearly vertical and strike the bottom-left or bottom-right.' },
  { name: 'The Bank Shot', diff: 2, desc: 'Bank the object ball off one rail into the pocket.', tip: 'Equal angles in and out — aim for the mirror image of the pocket.' },
  { name: 'The Combo', diff: 3, desc: 'Use one object ball to hit another into the pocket.', tip: 'Aim for the center of the first ball. The line between balls should point at the pocket.' },
  { name: 'The Carom Shot', diff: 4, desc: 'Bounce the cue ball off one object ball to pocket another.', tip: 'Thin hit on the first ball, sending the cue ball to the target.' },
  { name: 'The Draw Shot', diff: 2, desc: 'Pocket a ball and make the cue ball come back.', tip: 'Hit below center with a smooth, level stroke. Follow through is key.' },
  { name: 'The Long Shot', diff: 3, desc: 'Pocket a ball from the far end of the table.', tip: 'Bridge firmly, keep your eye on the target, stroke smoothly.' },
  { name: 'The Cluster Break', diff: 3, desc: 'Break a cluster of balls while pocketing one.', tip: 'Hit the edge of the cluster at an angle. The balls will scatter.' },
  { name: 'The Triple Rail', diff: 5, desc: 'Send the cue ball around three rails to reach the target.', tip: 'Use center ball. Aim 3 diamonds from the corner on the long rail.' },
  { name: 'The Kiss Shot', diff: 4, desc: 'Pocket a ball by kissing it off another ball.', tip: 'Line up the two balls so the second redirects the first into the pocket.' },
  { name: 'The Spin Transfer', diff: 3, desc: 'Transfer spin from the cue ball through an object ball.', tip: 'Hit the object ball with English. The spin carries through.' },
  { name: 'The Multi-Cushion', diff: 5, desc: 'Pocket a ball using 3 or more cushions.', tip: 'Plan the route in reverse from the pocket back through the rails.' },
  { name: 'The Plant', diff: 3, desc: 'Two touching balls — hit the first to pocket the second.', tip: 'Aim at the center of the first ball. Contact point determines direction.' },
  { name: 'The Screw Back', diff: 4, desc: 'Full-table draw: pocket and return cue ball to the far end.', tip: 'Maximum backspin — hit as low as possible with smooth acceleration.' },
  { name: 'The Stop Shot', diff: 1, desc: 'Pocket a ball and make the cue ball stop dead.', tip: 'Hit center ball with a firm stroke. Cue ball slides then stops on contact.' },
  { name: 'The Frozen Ball', diff: 3, desc: 'Pocket a ball frozen (touching) the rail.', tip: 'Aim slightly fuller than normal. The rail acts as a cushion.' },
  { name: 'The Obstacle Course', diff: 5, desc: 'Navigate through a maze of balls to pocket the target.', tip: 'Use precise angles and speed control. Multi-rail paths can be easier.' },
  { name: 'The Position Play', diff: 2, desc: 'Pocket a ball and place the cue ball for the next shot.', tip: 'Think two shots ahead. Softer hits give more position control.' },
  { name: 'The Safety', diff: 1, desc: 'Leave the cue ball hidden for your opponent.', tip: 'Hide behind another ball. Farther from the object ball = harder kick shot.' },
];

const LABELS = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Master'];
const COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

export default function TrickShotPage() {
  const [current, setCurrent] = useState(null);
  const [filter, setFilter] = useState(0);
  const [history, setHistory] = useState([]);
  const [showTip, setShowTip] = useState(false);

  const getRandom = () => {
    const pool = filter > 0 ? SHOTS.filter(s => s.diff === filter) : SHOTS;
    const shot = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(shot);
    setShowTip(false);
    setHistory(h => [{ name: shot.name, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }, ...h].slice(0, 20));
  };

  return (
    <main style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Trick Shot Challenge</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>Random trick shots to try at the table</p>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setFilter(0)} style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: filter === 0 ? '2px solid #0070f3' : '1px solid #ddd', background: filter === 0 ? '#e8f0fe' : '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>All</button>
        {[1,2,3,4,5].map(d => (
          <button key={d} onClick={() => setFilter(d)} style={{ padding: '0.4rem 0.8rem', borderRadius: 6, border: filter === d ? '2px solid #0070f3' : '1px solid #ddd', background: filter === d ? '#e8f0fe' : '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>{'⭐'.repeat(d)}</button>
        ))}
      </div>

      {current ? (
        <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{current.name}</h2>
            <span style={{ fontSize: '0.85rem', color: COLORS[current.diff] }}>{'⭐'.repeat(current.diff)} {LABELS[current.diff]}</span>
          </div>
          <p style={{ color: '#ccc', lineHeight: 1.6, marginBottom: '1rem' }}>{current.desc}</p>
          {showTip ? (
            <div style={{ background: '#2a2a4e', borderRadius: 10, padding: '1rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
              <strong style={{ color: '#f59e0b' }}>Tip:</strong> {current.tip}
            </div>
          ) : (
            <button onClick={() => setShowTip(true)} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1px solid #444', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '0.9rem' }}>Show Tip</button>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <p>Press the button to get a random trick shot!</p>
        </div>
      )}

      <button onClick={getRandom} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: 12, border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem' }}>Random Trick Shot</button>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: '#f8f9fa', borderRadius: 10 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{history.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Tried</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: '#f8f9fa', borderRadius: 10 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{new Set(history.map(h => h.name)).size}</div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Unique</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: '#f8f9fa', borderRadius: 10 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{SHOTS.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Total</div>
        </div>
      </div>

      {history.length > 0 && (
        <details style={{ fontSize: '0.85rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#555' }}>History ({history.length})</summary>
          <div style={{ marginTop: '0.5rem', maxHeight: 200, overflowY: 'auto' }}>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: i === 0 ? '#e8f0fe' : '#f8f9fa', borderRadius: 6, marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                <span>{h.name}</span>
                <span style={{ color: '#888' }}>{h.time}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </main>
  );
}