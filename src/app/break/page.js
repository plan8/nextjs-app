'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const TABLE_SIZES = {
  '7ft': { label: '7ft (Bar)', length: 2.13 },
  '8ft': { label: '8ft (Standard)', length: 2.44 },
  '9ft': { label: '9ft (Tournament)', length: 2.74 },
};

export default function BreakSpeedPage() {
  const [isListening, setIsListening] = useState(false);
  const [tableSize, setTableSize] = useState('9ft');
  const [distance, setDistance] = useState('2.74');
  const [threshold, setThreshold] = useState(0.5);
  const [result, setResult] = useState(null);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState('ready');
  const [history, setHistory] = useState([]);
  const [unit, setUnit] = useState('mph');
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const firstHitTime = useRef(null);
  const listeningForSecond = useRef(false);
  const cooldown = useRef(false);

  const calcSpeed = useCallback((t) => {
    const d = parseFloat(distance);
    const ms = d / t;
    return { ms, kmh: ms * 3.6, mph: ms * 2.237, time: t, dist: d };
  }, [distance]);

  const handleHit = useCallback((isFirst) => {
    if (cooldown.current) return;
    cooldown.current = true;
    setTimeout(() => cooldown.current = false, 300);
    const now = performance.now();
    if (isFirst) {
      firstHitTime.current = now;
      listeningForSecond.current = true;
      setStatus('listening for second hit...');
    } else if (firstHitTime.current) {
      listeningForSecond.current = false;
      const sec = (now - firstHitTime.current) / 1000;
      if (sec > 0.01 && sec < 5) {
        const r = calcSpeed(sec);
        setResult(r);
        setHistory(h => [{ speed: unit === 'kmh' ? r.kmh : r.mph, time: sec.toFixed(3), id: Date.now() }, ...h].slice(0, 10));
        setStatus('done! tap for new measurement');
      } else {
        setStatus('invalid measurement, try again');
      }
      firstHitTime.current = null;
    }
  }, [calcSpeed, unit]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 256; an.smoothingTimeConstant = 0.3;
      src.connect(an); analyserRef.current = an;
      setIsListening(true); setStatus('tap to start measuring');
      firstHitTime.current = null; listeningForSecond.current = false;
      const buf = new Uint8Array(an.frequencyBinCount);
      const tick = () => {
        an.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length / 255;
        setLevel(avg);
        if (avg > threshold && !cooldown.current) handleHit(!listeningForSecond.current);
        rafRef.current = requestAnimationFrame(tick);
      }; tick();
    } catch (e) { setStatus('could not access microphone: ' + e.message); }
  };

  const stopListening = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setIsListening(false); setStatus('ready'); setLevel(0);
    firstHitTime.current = null; listeningForSecond.current = false;
  };

  const manualStart = () => { firstHitTime.current = performance.now(); listeningForSecond.current = true; setStatus('listening for second hit...'); };
  const manualStop = () => { if (firstHitTime.current) handleHit(false); };
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {}); }, []);

  const speed = result ? (unit === 'kmh' ? result.kmh : result.mph).toFixed(1) : '--';
  const su = unit === 'kmh' ? 'km/h' : 'mph';

  return (
    <main style={{ maxWidth: 500, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Break Speed</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>Measure your billiard break speed</p>
      <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#555' }}>Settings</h3>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Table Size</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {Object.entries(TABLE_SIZES).map(([k, v]) => (
            <button key={k} onClick={() => { setTableSize(k); setDistance(v.length.toFixed(2)); }} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: tableSize === k ? '2px solid #0070f3' : '1px solid #ddd', background: tableSize === k ? '#e8f0fe' : '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>{k}</button>
          ))}
        </div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Distance (meters)</label>
        <input type="number" step="0.01" value={distance} onChange={e => setDistance(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '0.75rem' }} />
        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Sound threshold: {Math.round(threshold * 100)}%</label>
        <input type="range" min="0.1" max="0.9" step="0.05" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} style={{ width: '100%', marginBottom: '0.5rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['mph', 'kmh'].map(u => (
            <button key={u} onClick={() => setUnit(u)} style={{ flex: 1, padding: '0.4rem', borderRadius: 6, border: unit === u ? '2px solid #0070f3' : '1px solid #ddd', background: unit === u ? '#e8f0fe' : '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>{u === 'kmh' ? 'km/h' : 'mph'}</button>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '2rem', background: '#1a1a2e', borderRadius: 16, color: '#fff', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'monospace' }}>{speed}</div>
        <div style={{ fontSize: '1.2rem', color: '#aaa' }}>{su}</div>
        {result && <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>time: {result.time.toFixed(3)}s / distance: {result.dist}m</div>}
      </div>
      {isListening && <div style={{ height: 8, background: '#eee', borderRadius: 4, marginBottom: '1rem', overflow: 'hidden' }}><div style={{ height: '100%', width: (level * 100) + '%', background: level > threshold ? '#ff4444' : '#0070f3', borderRadius: 4, transition: 'width 0.05s' }} /></div>}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {!isListening ? (
          <button onClick={startListening} style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', borderRadius: 12, border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Start Microphone</button>
        ) : (<>
          <button onClick={stopListening} style={{ flex: 1, padding: '1rem', borderRadius: 12, border: 'none', background: '#ff4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Stop</button>
          {!listeningForSecond.current ? (
            <button onClick={manualStart} style={{ flex: 1, padding: '1rem', borderRadius: 12, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Start Timer</button>
          ) : (
            <button onClick={manualStop} style={{ flex: 1, padding: '1rem', borderRadius: 12, border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Stop Timer</button>
          )}
        </>)}
      </div>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>{status}</p>
      {history.length > 0 && <div style={{ marginTop: '2rem' }}><h3 style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>Measurements</h3>{history.map((h, i) => (<div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: i === 0 ? '#e8f0fe' : '#f8f9fa', borderRadius: 8, marginBottom: '0.25rem', fontSize: '0.9rem' }}><span>#{history.length - i}</span><span style={{ fontWeight: 600 }}>{h.speed.toFixed(1)} {su}</span><span style={{ color: '#888' }}>{h.time}s</span></div>))}</div>}
      <details style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}><summary style={{ cursor: 'pointer', fontWeight: 600 }}>How does it work?</summary><div style={{ marginTop: '0.5rem', lineHeight: 1.6 }}><p>1. Start the microphone</p><p>2. Make your break - the mic detects the first hit</p><p>3. When a ball hits the far rail, the second sound is detected</p><p>4. Speed = table length / time</p><p style={{ marginTop: '0.5rem' }}>Adjust the sound threshold if it is too sensitive. You can also use the manual timer.</p></div></details>
    </main>
  );
}