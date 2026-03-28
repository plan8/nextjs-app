import './globals.css'

export const metadata = {
  title: 'Next.js App - Plan8',
  description: 'Next.js app deployed to GitHub Pages',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}