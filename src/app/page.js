'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <main className="main">
      <h1 className="title">
        🚀 Next.js App
      </h1>
      <p className="subtitle">
        Deployed to GitHub Pages from <strong>plan8</strong>
      </p>
      <div className="card">
        <button onClick={() => setCount(count + 1)}>
          Count is {count}
        </button>
      </div>
      <div className="features">
        <Link href="/break" className="feature" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>🎱 Break Speed</h3>
          <p>Mät din biljard-sprängningshastighet</p>
        </Link>
        <div className="feature">
          <h3>⚡ Next.js 14</h3>
          <p>App Router + Static Export</p>
        </div>
        <div className="feature">
          <h3>🔄 GitHub Actions</h3>
          <p>Automatic build & deploy</p>
        </div>
      </div>
      <p className="footer">
        Built with Next.js + React 18
      </p>
    </main>
  )
}