'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [count, setCount] = useState(0)
  return (
    <main className="main">
      <h1 className="title">Next.js App</h1>
      <p className="subtitle">Deployed to GitHub Pages from <strong>plan8</strong></p>
      <div className="card"><button onClick={() => setCount(count + 1)}>Count is {count}</button></div>
      <div className="features">
        <Link href="/break" className="feature" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Break Speed</h3><p>Measure your billiard break speed</p>
        </Link>
        <Link href="/score" className="feature" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Score Tracker</h3><p>8-ball game score keeper</p>
        </Link>
        <Link href="/trickshots" className="feature" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Trick Shots</h3><p>Random trick shot challenges</p>
        </Link>
      </div>
      <p className="footer">Built with Next.js + React 18</p>
    </main>
  )
}