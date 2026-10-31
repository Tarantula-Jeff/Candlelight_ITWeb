import './globals.css'
import './react.css'

export const metadata = { title: 'Candlelight Studio', description: 'Creative coding, music, and AI art.' }

export default function RootLayout({ children }) {
  return <html lang="en"><head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" /></head><body>{children}</body></html>
}
