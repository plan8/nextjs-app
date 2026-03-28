'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const TABLE_SIZES = {
  '7ft': { label: '7 fot (Bar/Pub)', length: 2.13, width: 1.07 },
  '8ft': { label: '8 fot (Standard)', length: 2.44, width: 1.22 },
  '9ft': { label: "9 fot (Turnering)", length: 2.74, width: 1.37 },
};

export default function BreakSpeedPage() {
  const [isListening, setIsListening] = useState(false);
  const [tableSize, setTableSize] = useState('9ft');
  const [distance, setDistance] = useState('2.74');
  const [threshold, setThreshold] = useState(0.5);
  const [result, setResult] = useState(null);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState('redo');
  const [history, setHistory] = useState([]);
  const [unit, setUnit] = useState('kmh');

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const firstHitTime = useRef(null);
  const secondHitTime = useRef(null);
  const listeningForSecond = useRef(false);
  const cooldown = useRef(false);

  const calcSpeed = useCallback((timeSec) => {
    const dist = parseFloat(distance);
    const speedMs = dist / timeSec;
    const speedKmh = speedMs * 3.6;
    const speedMph = speedMs * 2.237;
    return { speedMs, speedKmh, speedMph, timeSec, distance: dist };
  }, [distance]);

  const handleHit = useCallback((isFirst) => {
    if (cooldown.current) return;
    cooldown.current = true;
    setTimeout(() => { cooldown.current = false; }, 300);

    const now = performance.now();
    
    if (isFirst) {
      firstHitTime.current = now;
      listeningForSecond.current = true;
      setStatus('lyssnar på andra smällen...');
    } else {
      secondHitTime.current = now;
      listeningForSecond.current = false;
      
      const elapsedMs = secondHitTime.current - firstHitTime.current;
      const elapsedSec = elapsedMs / 1000;
      
      if (elapsedSec > 0.01 && elapsedSec < 5) {
        const res = calcSpeed(elapsedSec);
        setResult(res);
        setHistory(h => [{
          speed: unit === 'kmh' ? res.speedKmh : res.speedMph,
          time: elapsedSec.toFixed(3),
          id: Date.now()
        }, ...h].slice(0, 10));
        setStatus('klart! tryck för ny mätning');
      } else {
        setStatus('ogiltig mätning, försök igen');
      }
      firstHitTime.current = null;
      secondHitTime.current = null;
    }
  }, [calcSpeed, unit]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      setIsListening(true);
      setStatus('tryck för att börja mäta');
      firstHitTime.current = null;
      listeningForSecond.current = false;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = avg / 255;
        setLevel(normalized);
        
        if (normalized > threshold && !cooldown.current) {
          handleHit(!listeningForSecond.current);
        }
        
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setStatus('kunde inte nå mikrofonen: ' + err.message);
    }
  };

  const stopListening = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioCtxRef.current) audioCtxRef.current.close();
    setIsListening(false);
    setStatus('redo');
    setLevel(0);
    firstHitTime.current = null;
    listeningForSecond.current = false;
  };

  const handleTableChange = (size) => {
    setTableSize(size);
    setDistance(TABLE_SIZES[size].length.toFixed(2));
  };

  const manualStart = () => {
    firstHitTime.current = performance.now();
    listeningForSecond.current = true;
    setStatus('lyssnar på andra smällen...');
  };

  const manualStop = () => {
    if (firstHitTime.current) {
      handleHit(false);
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  const speedDisplay = result 
    ? (unit === 'kmh' ? result.speedKmh : result.speedMph).toFixed(1)
    : '--';
  const speedUnit = unit === 'kmh' ? 'km/h' : 'mph';

  return (
    <main style={{
      maxWidth: 500, margin: '0 auto', padding: '2rem 1rem',
      fontFamily: 'system-ui, sans-serif', minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        🎱 Break Speed
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
        Mät din biljard-sprängningshastighet
      </p>

      {/* Settings */}
      <div style={{
        background: '#f8f9fa', borderRadius: 12, padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#555' }}>⚙️ Inställningar</h3>
        
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          Bordstorlek
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {Object.entries(TABLE_SIZES).map(([key, val]) => (
            <button key={key} onClick={() => handleTableChange(key)} style={{
              flex: 1, padding: '0.5rem', borderRadius: 8,
              border: tableSize === key ? '2px solid #0070f3' : '1px solid #ddd',
              background: tableSize === key ? '#e8f0fe' : '#fff',
              cursor: 'pointer', fontSize: '0.8rem'
            }}>
              {key}
            </button>
          ))}
        </div>

        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
          Längd (meter)
        </label>
        <input type="number" step="0.01" value={distance}
          onChange={e => setDistance(e.target.value)}
          style={{
            width: '100%', padding: '0.5rem', borderRadius: 8,
            border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box',
            marginBottom: '0.75rem'
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
          Ljudtröskel: {Math.round(threshold * 100)}%
        </label>
        <input type="range" min="0.1" max="0.9" step="0.05" value={threshold}
          onChange={e => setThreshold(parseFloat(e.target.value))}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setUnit('kmh')} style={{
            flex: 1, padding: '0.4rem', borderRadius: 6,
            border: unit === 'kmh' ? '2px solid #0070f3' : '1px solid #ddd',
            background: unit === 'kmh' ? '#e8f0fe' : '#fff',
            cursor: 'pointer', fontSize: '0.8rem'
          }}>km/h</button>
          <button onClick={() => setUnit('mph')} style={{
            flex: 1, padding: '0.4rem', borderRadius: 6,
            border: unit === 'mph' ? '2px solid #0070f3' : '1px solid #ddd',
            background: unit === 'mph' ? '#e8f0fe' : '#fff',
            cursor: 'pointer', fontSize: '0.8rem'
          }}>mph</button>
        </div>
      </div>

      {/* Main display */}
      <div style={{
        textAlign: 'center', padding: '2rem', background: '#1a1a2e',
        borderRadius: 16, color: '#fff', marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'monospace' }}>
          {speedDisplay}
        </div>
        <div style={{ fontSize: '1.2rem', color: '#aaa' }}>{speedUnit}</div>
        {result && (
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
            tid: {result.timeSec.toFixed(3)}s · sträcka: {result.distance}m
          </div>
        )}
      </div>

      {/* Mic level */}
      {isListening && (
        <div style={{
          height: 8, background: '#eee', borderRadius: 4,
          marginBottom: '1rem', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', width: `${level * 100}%`,
            background: level > threshold ? '#ff4444' : '#0070f3',
            borderRadius: 4, transition: 'width 0.05s'
          }} />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {!isListening ? (
          <button onClick={startListening} style={{
            flex: 1, padding: '1rem', fontSize: '1.1rem', borderRadius: 12,
            border: 'none', background: '#0070f3', color: '#fff',
            cursor: 'pointer', fontWeight: 600
          }}>
            🎤 Starta mikrofon
          </button>
        ) : (
          <>
            <button onClick={stopListening} style={{
              flex: 1, padding: '1rem', fontSize: '1rem', borderRadius: 12,
              border: 'none', background: '#ff4444', color: '#fff',
              cursor: 'pointer', fontWeight: 600
            }}>
              ⏹ Stoppa
            </button>
            {!listeningForSecond.current ? (
              <button onClick={manualStart} style={{
                flex: 1, padding: '1rem', fontSize: '1rem', borderRadius: 12,
                border: 'none', background: '#22c55e', color: '#fff',
                cursor: 'pointer', fontWeight: 600
              }}>
                ▶️ Starta timer
              </button>
            ) : (
              <button onClick={manualStop} style={{
                flex: 1, padding: '1rem', fontSize: '1rem', borderRadius: 12,
                border: 'none', background: '#f59e0b', color: '#fff',
                cursor: 'pointer', fontWeight: 600
              }}>
                ⏱ Stoppa timer
              </button>
            )}
          </>
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
        {status}
      </p>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>
            📊 Tidigare mätningar
          </h3>
          {history.map((h, i) => (
            <div key={h.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '0.5rem 0.75rem', background: i === 0 ? '#e8f0fe' : '#f8f9fa',
              borderRadius: 8, marginBottom: '0.25rem', fontSize: '0.9rem'
            }}>
              <span>#{history.length - i}</span>
              <span style={{ fontWeight: 600 }}>{h.speed.toFixed(1)} {speedUnit}</span>
              <span style={{ color: '#888' }}>{h.time}s</span>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <details style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Hur funkar det?</summary>
        <div style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
          <p>1. Starta mikrofonen</p>
          <p>2. Gör din break — mikrofonen detekterar första smällen</p>
          <p>3. När en boll träffar fjärrbandet detekteras det andra ljudet</p>
          <p>4. Hastighet = bordets längd ÷ tid</p>
          <p style={{ marginTop: '0.5rem' }}>
            Justera ljudtröskeln om det är för känsligt eller inte känsligt nog.
            Du kan också använda manuell timer om mikrofonen inte funkar bra.
          </p>
        </div>
      </details>
    </main>
  );
}