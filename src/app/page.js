'use client'

import { useState } from 'react'

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
        <div className="feature">
          <h3>⚡ Next.js 14</h3>
          <p>App Router + Static Export</p>
        </div>
        <div className="feature">
          <h3>🔄 GitHub Actions</h3>
          <p>Automatic build & deploy</p>
        </div>
        <div className="feature">
          <h3>📦 GitHub Pages</h3>
          <p>Free static hosting</p>
        </div>
      </div>
      <p className="footer">
        Built with Next.js + React 18
      </p>
    </main>
  )
}