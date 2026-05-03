import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import { Proof } from '@/types'
import { formatDate, scoreToLabel } from '@/lib/utils'
import CertClient from './CertClient'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('proofs').select('*').eq('id', params.id).single()
  if (!data) return { title: 'Certificat introuvable' }
  const proof = data as Proof
  const score = proof.credibility_score
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proofly.app'

  return {
    title: `${proof.title} — ${params.id}`,
    description: `Certificat d'authenticité Proofly · Score de crédibilité : ${score}/100 · ${proof.analysis?.summary?.slice(0, 120) || ''}`,
    openGraph: {
      title: `${proof.title} — Certifié Proofly`,
      description: `Score de crédibilité : ${score}/100 · ${scoreToLabel(score)} · Certifié par intelligence artificielle`,
      url: `${appUrl}/cert/${params.id}`,
      siteName: 'Proofly',
      images: [
        {
          url: `${appUrl}/api/og?id=${params.id}`,
          width: 1200,
          height: 630,
          alt: `Certificat Proofly — ${proof.title}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${proof.title} — Certifié Proofly`,
      description: `Score de crédibilité : ${score}/100 · ${scoreToLabel(score)}`,
      images: [`${appUrl}/api/og?id=${params.id}`],
    },
  }
}

export default async function CertPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('proofs').select('*').eq('id', params.id).single()
  if (error || !data) notFound()

  const proof = data as Proof

  // Get user display info (non-sensitive)
  const { data: userData } = await supabase.auth.admin.getUserById(proof.user_id)
  const userEmail = userData?.user?.email || ''
  const userName = userData?.user?.user_metadata?.full_name || userEmail.split('@')[0] || 'Utilisateur'

  return <CertClient proof={proof} userName={userName} />
}
