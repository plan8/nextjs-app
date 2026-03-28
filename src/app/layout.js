import './globals.css'

export const metadata = {
  title: 'Next.js App - Plan8',
  description: 'Next.js app deployed to GitHub Pages',
}

const navStyle = {
  display: 'flex', gap: '1rem', padding: '1rem 2rem',
  background: '#1a1a2e', justifyContent: 'center',
  flexWrap: 'wrap'
};

const linkStyle = {
  color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem',
  borderRadius: 8, fontSize: '0.95rem', fontWeight: 500,
  transition: 'background 0.2s'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <nav style={navStyle}>
          <a href="/nextjs-app/" style={linkStyle}>🏠 Hem</a>
          <a href="/nextjs-app/break" style={linkStyle}>🎱 Break Speed</a>
          <a href="/nextjs-app/score" style={linkStyle}>🏆 Poängräknare</a>
        </nav>
        {children}
      </body>
    </html>
  )
}