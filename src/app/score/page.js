'use client';

import { useState } from 'react';

const SOLIDS = [1,2,3,4,5,6,7];
const STRIPES = [9,10,11,12,13,14,15];

const BALL_COLORS = {
  1: '#FFD700', 2: '#0000CD', 3: '#FF0000', 4: '#800080',
  5: '#FF4500', 6: '#006400', 7: '#8B4513', 8: '#000000',
  9: '#FFD700', 10: '#0000CD', 11: '#FF0000', 12: '#800080',
  13: '#FF4500', 14: '#006400', 15: '#8B4513',
};

function Ball({ number, pocketed, onClick }) {
  const isStripe = number > 8;
  const color = BALL_COLORS[number];
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: '50%',
      border: '2px solid #333', cursor: 'pointer',
      background: pocketed 
        ? '#ddd' 
        : isStripe 
          ? `linear-gradient(180deg, ${color} 20%, #fff 20%, #fff 80%, ${color} 80%)`
          : color,
      color: number === 8 ? '#fff' : (number > 8 ? '#333' : '#fff'),
      fontWeight: 700, fontSize: '0.85rem',
      opacity: pocketed ? 0.3 : 1,
      textDecoration: pocketed ? 'line-through' : 'none',
      transition: 'all 0.2s',
      boxShadow: pocketed ? 'none' : '0 2px 4px rgba(0,0,0,0.3)'
    }}>
      {number}
    </button>
  );
}

export default function ScorePage() {
  const [p1Name, setP1Name] = useState('Spelare 1');
  const [p2Name, setP2Name] = useState('Spelare 2');
  const [p1Group, setP1Group] = useState(null);
  const [p2Group, setP2Group] = useState(null);
  const [pocketed, setPocketed] = useState(new Set());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [foul, setFoul] = useState(false);
  const [games, setGames] = useState([]);

  const togglePocket = (num) => {
    if (gameOver) return;
    const next = new Set(pocketed);
    
    if (next.has(num)) {
      next.delete(num);
      if (num === 8) { setGameOver(false); setWinner(null); }
    } else {
      next.add(num);
      
      if (num === 8) {
        setGameOver(true);
        const myGroup = currentPlayer === 1 ? p1Group : p2Group;
        const groupBalls = myGroup === 'solids' ? SOLIDS : STRIPES;
        const allPocketed = groupBalls.every(b => next.has(b));
        setWinner(allPocketed ? currentPlayer : (currentPlayer === 1 ? 2 : 1));
      }
      
      if (!p1Group && num !== 8) {
        if (SOLIDS.includes(num)) { setP1Group('solids'); setP2Group('stripes'); }
        else { setP1Group('stripes'); setP2Group('solids'); }
      }
    }
    setPocketed(next);
    setFoul(false);
  };

  const switchPlayer = () => {
    setCurrentPlayer(c => c === 1 ? 2 : 1);
    setFoul(false);
  };

  const callFoul = () => {
    setFoul(true);
    setCurrentPlayer(c => c === 1 ? 2 : 1);
  };

  const resetGame = () => {
    if (winner) {
      setGames(g => [...g, { 
        winner: winner === 1 ? p1Name : p2Name, 
        time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
    setPocketed(new Set());
    setP1Group(null);
    setP2Group(null);
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(null);
    setFoul(false);
  };

  const swapGroups = () => {
    setP1Group(g => g === 'solids' ? 'stripes' : 'solids');
    setP2Group(g => g === 'solids' ? 'stripes' : 'solids');
  };

  const p1Remaining = p1Group 
    ? (p1Group === 'solids' ? SOLIDS : STRIPES).filter(b => !pocketed.has(b)).length 
    : 7;
  const p2Remaining = p2Group 
    ? (p2Group === 'solids' ? SOLIDS : STRIPES).filter(b => !pocketed.has(b)).length 
    : 7;

  return (
    <main style={{
      maxWidth: 500, margin: '0 auto', padding: '1.5rem 1rem',
      fontFamily: 'system-ui, sans-serif', minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
        Ã°ÂÂÂ 8-Ball PoÃÂ¤ngrÃÂ¤knare
      </h1>

      {/* Score display */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {[1, 2].map(p => {
          const isActive = currentPlayer === p && !gameOver;
          const name = p === 1 ? p1Name : p2Name;
          const group = p === 1 ? p1Group : p2Group;
          const remaining = p === 1 ? p1Remaining : p2Remaining;
          const isWinner = winner === p;
          
          return (
            <div key={p} style={{
              background: isWinner ? '#22c55e' : isActive ? '#1a1a2e' : '#f8f9fa',
              color: isWinner || isActive ? '#fff' : '#333',
              borderRadius: 12, padding: '1rem', textAlign: 'center',
              border: isActive ? '3px solid #0070f3' : '2px solid transparent',
              transition: 'all 0.3s'
            }}>
              <input value={name} onChange={e => p === 1 ? setP1Name(e.target.value) : setP2Name(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: 'inherit',
                  fontSize: '1rem', fontWeight: 600, textAlign: 'center',
                  width: '100%', outline: 'none'
                }}
              />
              {group && (
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.8 }}>
                  {group === 'solids' ? 'Ã¢ÂÂ Solids' : 'Ã¢ÂÂ Stripes'} ÃÂ· {remaining} kvar
                </div>
              )}
              {isWinner && <div style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>Ã°ÂÂÂ VINST!</div>}
            </div>
          );
        })}
      </div>

      {foul && (
        <div style={{
          background: '#ff4444', color: '#fff', textAlign: 'center',
          padding: '0.5rem', borderRadius: 8, marginBottom: '1rem',
          fontWeight: 600
        }}>
          Ã¢ÂÂ Ã¯Â¸Â FEL! Tur byte
        </div>
      )}

      {/* Ball rack */}
      {!gameOver && (
        <>
          <div style={{
            background: '#0a6b32', borderRadius: 16, padding: '1.5rem 1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ textAlign: 'center', color: '#fff', fontSize: '0.8rem', marginBottom: '0.75rem', opacity: 0.7 }}>
              Tryck pÃÂ¥ en boll fÃÂ¶r att markera som nedfÃÂ¤lld
            </div>
            
            {/* Solids */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              {SOLIDS.map(n => (
                <Ball key={n} number={n} pocketed={pocketed.has(n)} onClick={() => togglePocket(n)} />
              ))}
            </div>
            
            {/* 8 ball */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <Ball number={8} pocketed={pocketed.has(8)} onClick={() => togglePocket(8)} />
            </div>
            
            {/* Stripes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {STRIPES.map(n => (
                <Ball key={n} number={n} pocketed={pocketed.has(n)} onClick={() => togglePocket(n)} />
              ))}
            </div>
          </div>

          {/* Group assignment */}
          {!p1Group && (
            <div style={{
              textAlign: 'center', fontSize: '0.85rem', color: '#444',
              marginBottom: '1rem'
            }}>
              FÃÂ¶rsta bollen som fÃÂ¤lls bestÃÂ¤mmer grupp
            </div>
          )}
          {p1Group && (
            <button onClick={swapGroups} style={{
              display: 'block', margin: '0 auto 1rem', padding: '0.4rem 1rem',
              borderRadius: 6, border: '1px solid #ddd', background: '#fff',
              cursor: 'pointer', fontSize: '0.8rem', color: '#444'
            }}>
              Ã°ÂÂÂ Byt grupper
            </button>
          )}
        </>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button onClick={switchPlayer} disabled={gameOver} style={{
          flex: 1, padding: '0.75rem', borderRadius: 10,
          border: 'none', background: gameOver ? '#ccc' : '#0070f3',
          color: '#fff', cursor: gameOver ? 'default' : 'pointer',
          fontWeight: 600, fontSize: '0.9rem'
        }}>
          Ã°ÂÂÂ Byt tur
        </button>
        <button onClick={callFoul} disabled={gameOver} style={{
          flex: 1, padding: '0.75rem', borderRadius: 10,
          border: 'none', background: gameOver ? '#ccc' : '#ff4444',
          color: '#fff', cursor: gameOver ? 'default' : 'pointer',
          fontWeight: 600, fontSize: '0.9rem'
        }}>
          Ã¢ÂÂ Ã¯Â¸Â FEL
        </button>
        <button onClick={resetGame} style={{
          padding: '0.75rem 1rem', borderRadius: 10,
          border: '1px solid #ddd', background: '#fff',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
        }}>
          Ã°ÂÂÂ
        </button>
      </div>

      {/* Game history */}
      {games.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.9rem', color: '#1a1a1b', marginBottom: '0.5rem' }}>
            Ã°ÂÂÂ Matcher ({games.length})
          </h3>
          {games.map((g, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '0.4rem 0.75rem', background: '#f8f9fa',
              borderRadius: 8, marginBottom: '0.25rem', fontSize: '0.85rem'
            }}>
              <span>#{i + 1}</span>
              <span style={{ fontWeight: 600 }}>{g.winner}</span>
              <span style={{ color: '#666' }}>{g.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rules */}
      <details style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#444' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Regler</summary>
        <div style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
          <p>Ã¢ÂÂ¢ Spelare 1 bollar fÃÂ¶rst Ã¢ÂÂ fÃÂ¶rsta bollen bestÃÂ¤mmer grupp</p>
          <p>Ã¢ÂÂ¢ Solids: 1-7 ÃÂ· Stripes: 9-15</p>
          <p>Ã¢ÂÂ¢ FÃÂ¤ll alla dina bollar, sen 8-bollen fÃÂ¶r att vinna</p>
          <p>Ã¢ÂÂ¢ FEL-knappen byter tur (t.ex. vit boll i hÃÂ¥l)</p>
          <p>Ã¢ÂÂ¢ Tryck pÃÂ¥ en boll igen fÃÂ¶r att ÃÂ¥ngra</p>
        </div>
      </details>
    </main>
  );
}