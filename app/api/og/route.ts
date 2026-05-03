import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { scoreToLabel } from '@/lib/utils'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return new NextResponse('Missing id', { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: proof } = await supabase.from('proofs').select('*').eq('id', id).single()

  const title   = proof?.title || 'Certificat Proofly'
  const score   = proof?.credibility_score || 0
  const label   = scoreToLabel(score)
  const type    = proof?.type || 'document'
  const scoreColor = score >= 80 ? '#006B3E' : score >= 60 ? '#00349A' : '#C9020D'

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
    </style>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#FAFAF8"/>

  <!-- Border frame -->
  <rect x="1" y="1" width="1198" height="628" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.5"/>

  <!-- Top bar -->
  <rect x="0" y="0" width="1200" height="2" fill="#111111"/>

  <!-- Logo mark -->
  <rect x="60" y="56" width="32" height="32" rx="3" fill="none" stroke="#111111" stroke-width="1.5"/>
  <circle cx="76" cy="72" r="8" fill="none" stroke="#111111" stroke-width="1.5"/>

  <!-- Proofly name -->
  <text x="106" y="69" font-family="'IBM Plex Mono',monospace" font-size="13" font-weight="400" fill="#111111" letter-spacing="3">PROOFLY</text>
  <text x="106" y="84" font-family="'IBM Plex Mono',monospace" font-size="9" fill="#8C8880" letter-spacing="2">REGISTRE DE CERTIFICATIONS</text>

  <!-- Cert ID -->
  <text x="1140" y="69" font-family="'IBM Plex Mono',monospace" font-size="13" font-weight="500" fill="#111111" text-anchor="end">${id}</text>

  <!-- Separator -->
  <line x1="60" y1="116" x2="1140" y2="116" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>

  <!-- Title -->
  <text x="60" y="200" font-family="'Cormorant Garamond',serif" font-size="52" font-weight="300" fill="#111111">${escapeXml(truncate(title, 38))}</text>
  ${title.length > 38 ? `<text x="60" y="262" font-family="'Cormorant Garamond',serif" font-size="52" font-weight="300" fill="#111111">${escapeXml(title.slice(38, 65))}…</text>` : ''}

  <!-- Type badge -->
  <rect x="60" y="${title.length > 38 ? 296 : 234}" width="80" height="24" rx="0" fill="none" stroke="rgba(0,0,0,0.14)" stroke-width="0.5"/>
  <text x="100" y="${title.length > 38 ? 311 : 249}" font-family="'IBM Plex Mono',monospace" font-size="10" fill="#5A5652" text-anchor="middle" letter-spacing="1.5">${type.toUpperCase()}</text>

  <!-- Bottom section separator -->
  <line x1="60" y1="490" x2="1140" y2="490" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>

  <!-- Score block -->
  <rect x="920" y="390" width="200" height="120" rx="0" fill="#FFFFFF" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
  <text x="1020" y="460" font-family="'Cormorant Garamond',serif" font-size="64" font-weight="300" fill="${scoreColor}" text-anchor="middle">${score}</text>
  <text x="1020" y="490" font-family="'IBM Plex Mono',monospace" font-size="9" fill="#8C8880" text-anchor="middle" letter-spacing="1.5">SCORE DE CRÉDIBILITÉ</text>

  <!-- Status label -->
  <rect x="920" y="524" width="200" height="24" fill="${scoreColor}" rx="0" opacity="0.08"/>
  <rect x="920" y="524" width="200" height="24" fill="none" stroke="${scoreColor}" stroke-width="0.5"/>
  <text x="1020" y="540" font-family="'IBM Plex Mono',monospace" font-size="10" fill="${scoreColor}" text-anchor="middle" letter-spacing="2">${label.toUpperCase()}</text>

  <!-- Seal circle -->
  <circle cx="100" cy="560" r="30" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
  <circle cx="100" cy="560" r="25" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
  <text x="100" y="556" font-family="'IBM Plex Mono',monospace" font-size="7" fill="#8C8880" text-anchor="middle" letter-spacing="0.5">PROOFLY</text>
  <text x="100" y="568" font-family="'IBM Plex Mono',monospace" font-size="10" fill="#111111" text-anchor="middle">✓</text>

  <!-- Footer text -->
  <text x="145" y="553" font-family="'IBM Plex Mono',monospace" font-size="10" fill="#8C8880" letter-spacing="0.5">Certifié par intelligence artificielle · Immuable</text>
  <text x="145" y="570" font-family="'IBM Plex Mono',monospace" font-size="9" fill="#C8C4BC" letter-spacing="0.5">proofly.app/cert/${id}</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

function escapeXml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) : str
}
