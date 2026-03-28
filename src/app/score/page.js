'use client';
import { useState } from 'react';

const SOLIDS = [1,2,3,4,5,6,7];
const STRIPES = [9,10,11,12,13,14,15];
const COLORS = { 1:'#FFD700', 2:'#0000CD', 3:'#FF0000', 4:'#800080', 5:'#FF4500', 6:'#006400', 7:'#8B4513', 8:'#000000', 9:'#FFD700', 10:'#0000CD', 11:'#FF0000', 12:'#800080', 13:'#FF4500', 14:'#006400', 15:'#8B4513' };

function Ball({ number, pocketed, onClick }) {
  const stripe = number > 8;
  const c = COLORS[number];
  return (<button onClick={onClick} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #333', cursor: 'pointer', background: pocketed ? '#ddd' : stripe ? 'linear-gradient(180deg,'+c+' 20%,#fff 20%,#fff 80%,'+c+' 80%)' : c, color: number===8?'#fff':(number>8?'#333':'#fff'), fontWeight: 700, fontSize: '0.85rem', opacity: pocketed?0.3:1, textDecoration: pocketed?'line-through':'none', transition: 'all 0.2s', boxShadow: pocketed?'none':'0 2px 4px rgba(0,0,0,0.3)' }}>{number}</button>);
}

export default function ScorePage() {
  const [p1, setP1] = useState('Player 1');
  const [p2, setP2] = useState('Player 2');
  const [g1, setG1] = useState(null);
  const [g2, setG2] = useState(null);
  const [pocketed, setPocketed] = useState(new Set());
  const [turn, setTurn] = useState(1);
  const [over, setOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [foul, setFoul] = useState(false);
  const [games, setGames] = useState([]);

  const toggle = (n) => {
    if (over) return;
    const s = new Set(pocketed);
    if (s.has(n)) { s.delete(n); if (n===8){setOver(false);setWinner(null);} }
    else {
      s.add(n);
      if (n===8) { setOver(true); const g = turn===1?g1:g2; const balls = g==='solids'?SOLIDS:STRIPES; setWinner(balls.every(b=>s.has(b))?turn:(turn===1?2:1)); }
      if (!g1 && n!==8) { if (SOLIDS.includes(n)){setG1('solids');setG2('stripes');}else{setG1('stripes');setG2('solids');} }
    }
    setPocketed(s); setFoul(false);
  };

  const swap = () => { setTurn(t=>t===1?2:1); setFoul(false); };
  const doFoul = () => { setFoul(true); setTurn(t=>t===1?2:1); };

  const reset = () => {
    if (winner) setGames(g=>[...g,{ w: winner===1?p1:p2, t: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) }]);
    setPocketed(new Set()); setG1(null); setG2(null); setTurn(1); setOver(false); setWinner(null); setFoul(false);
  };

  const r1 = g1 ? (g1==='solids'?SOLIDS:STRIPES).filter(b=>!pocketed.has(b)).length : 7;
  const r2 = g2 ? (g2==='solids'?SOLIDS:STRIPES).filter(b=>!pocketed.has(b)).length : 7;

  return (
    <main style={{ maxWidth:500, margin:'0 auto', padding:'1.5rem 1rem', fontFamily:'system-ui, sans-serif' }}>
      <h1 style={{ textAlign:'center', fontSize:'1.6rem', marginBottom:'1.5rem' }}>8-Ball Score Tracker</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        {[1,2].map(pl => {
          const active = turn===pl && !over;
          const nm = pl===1?p1:p2;
          const gr = pl===1?g1:g2;
          const rem = pl===1?r1:r2;
          const win = winner===pl;
          return (<div key={pl} style={{ background:win?'#22c55e':active?'#1a1a2e':'#f8f9fa', color:win||active?'#fff':'#333', borderRadius:12, padding:'1rem', textAlign:'center', border:active?'3px solid #0070f3':'2px solid transparent' }}>
            <input value={nm} onChange={e=>pl===1?setP1(e.target.value):setP2(e.target.value)} style={{ background:'transparent', border:'none', color:'inherit', fontSize:'1rem', fontWeight:600, textAlign:'center', width:'100%', outline:'none' }} />
            {gr && <div style={{ fontSize:'0.8rem', marginTop:'0.25rem', opacity:0.8 }}>{gr==='solids'?'Solids':'Stripes'} / {rem} left</div>}
            {win && <div style={{ fontSize:'1.2rem', marginTop:'0.5rem' }}>WINNER!</div>}
          </div>);
        })}
      </div>
      {foul && <div style={{ background:'#ff4444', color:'#fff', textAlign:'center', padding:'0.5rem', borderRadius:8, marginBottom:'1rem', fontWeight:600 }}>FOUL! Turn changed</div>}
      {!over && (<><div style={{ background:'#0a6b32', borderRadius:16, padding:'1.5rem 1rem', marginBottom:'1rem' }}>
        <div style={{ textAlign:'center', color:'#fff', fontSize:'0.8rem', marginBottom:'0.75rem', opacity:0.7 }}>Tap a ball to mark as pocketed</div>
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:8 }}>{SOLIDS.map(n=><Ball key={n} number={n} pocketed={pocketed.has(n)} onClick={()=>toggle(n)} />)}</div>
        <div style={{ display:'flex', justifyContent:'center', margin:'8px 0' }}><Ball number={8} pocketed={pocketed.has(8)} onClick={()=>toggle(8)} /></div>
        <div style={{ display:'flex', justifyContent:'center', gap:6 }}>{STRIPES.map(n=><Ball key={n} number={n} pocketed={pocketed.has(n)} onClick={()=>toggle(n)} />)}</div>
      </div>
      {!g1 && <div style={{ textAlign:'center', fontSize:'0.85rem', color:'#666', marginBottom:'1rem' }}>First pocketed ball determines group</div>}
      {g1 && <button onClick={()=>{setG1(g=>g==='solids'?'stripes':'solids');setG2(g=>g==='solids'?'stripes':'solids');}} style={{ display:'block', margin:'0 auto 1rem', padding:'0.4rem 1rem', borderRadius:6, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontSize:'0.8rem', color:'#666' }}>Swap groups</button>}</>
      )}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
        <button onClick={swap} disabled={over} style={{ flex:1, padding:'0.75rem', borderRadius:10, border:'none', background:over?'#ccc':'#0070f3', color:'#fff', cursor:over?'default':'pointer', fontWeight:600, fontSize:'0.9rem' }}>Switch Turn</button>
        <button onClick={doFoul} disabled={over} style={{ flex:1, padding:'0.75rem', borderRadius:10, border:'none', background:over?'#ccc':'#ff4444', color:'#fff', cursor:over?'default':'pointer', fontWeight:600, fontSize:'0.9rem' }}>FOUL</button>
        <button onClick={reset} style={{ padding:'0.75rem 1rem', borderRadius:10, border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontWeight:600, fontSize:'0.9rem' }}>Reset</button>
      </div>
      {games.length>0 && <div><h3 style={{ fontSize:'0.9rem', color:'#555', marginBottom:'0.5rem' }}>Games ({games.length})</h3>{games.map((g,i)=>(<div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0.75rem', background:'#f8f9fa', borderRadius:8, marginBottom:'0.25rem', fontSize:'0.85rem' }}><span>#{i+1}</span><span style={{ fontWeight:600 }}>{g.w}</span><span style={{ color:'#888' }}>{g.t}</span></div>))}</div>}
      <details style={{ marginTop:'2rem', fontSize:'0.8rem', color:'#666' }}><summary style={{ cursor:'pointer', fontWeight:600 }}>Rules</summary><div style={{ marginTop:'0.5rem', lineHeight:1.6 }}><p>Player 1 breaks - first pocketed ball determines group</p><p>Solids: 1-7 / Stripes: 9-15</p><p>Pocket all your balls, then the 8-ball to win</p><p>FOUL button switches turn (e.g. scratch)</p><p>Tap a pocketed ball again to undo</p></div></details>
    </main>
  );
}