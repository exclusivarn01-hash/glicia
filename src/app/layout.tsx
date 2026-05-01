import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlicIA — Assistente de Glicemia',
  description: 'Monitore sua glicemia com inteligência.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
