'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Proof } from '@/types'
import { formatDate, scoreToLabel } from '@/lib/utils'

export default function CertClient({ proof, userName }: { proof: Proof; userName: string }) {
  const [copied, setCopied] = useState(false)
  const score = proof.credibility_score
  const label = scoreToLabel(score)
  const statusColor = score >= 80 ? 'var(--vert)' : score >= 60 ? 'var(--bleu)' : score >= 40 ? '#B45309' : 'var(--rouge)'
  const statusBg   = score >= 80 ? 'rgba(0,107,62,0.05)' : score >= 60 ? 'rgba(0,52,154,0.05)' : score >= 40 ? 'rgba(180,83,9,0.05)' : 'rgba(201,2,13,0.05)'

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://proofly.app'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--creme)', fontFamily: "'IBM Plex Sans',sans-serif" }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(250,250,248,0.94)', backdropFilter: 'blur(8px)', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <LogoMark />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '17px', fontWeight: 500, letterSpacing: '0.05em' }}>Proofly</span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={copyLink} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 16px', border: '0.5px solid rgba(0,0,0,0.2)', background: copied ? 'var(--encre)' : 'transparent', color: copied ? 'var(--blanc)' : 'var(--encre)', cursor: 'pointer', transition: 'all 0.15s' }}>
              {copied ? 'Copié ✓' : 'Partager'}
            </button>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${appUrl}/cert/${proof.id}`)}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 16px', border: '0.5px solid rgba(0,0,0,0.2)', background: 'transparent', color: 'var(--encre)', cursor: 'pointer', textDecoration: 'none' }}>
              LinkedIn
            </a>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '88px 2rem 5rem' }}>

        {/* Official header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogoMark size={36} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '17px', fontWeight: 500, letterSpacing: '0.04em' }}>Proofly</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gris-4)', marginTop: '1px' }}>Registre de certifications</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', fontWeight: 500 }}>{proof.id}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', color: 'var(--gris-4)', marginTop: '3px' }}>
              {formatDate(proof.created_at)}
            </div>
          </div>
        </div>

        {/* Certificate body */}
        <div style={{ background: 'var(--blanc)', border: '0.5px solid rgba(0,0,0,0.12)' }}>

          {/* Title block */}
          <div style={{ padding: '2.5rem 2.5rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gris-4)', marginBottom: '1rem' }}>
              Certificat d'authenticité du travail
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 300, lineHeight: 1.15, marginBottom: '1rem' }}>
              {proof.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', fontStyle: 'italic', color: 'var(--gris-5)' }}>
                Délivré à {userName}
              </span>
              <span style={{ color: 'var(--gris-3)' }}>·</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', border: '0.5px solid rgba(0,0,0,0.14)', color: 'var(--gris-5)' }}>
                {proof.type}
              </span>
              {proof.plan_at_creation !== 'free' && (
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', border: '0.5px solid rgba(0,0,0,0.14)', color: 'var(--gris-5)' }}>
                  {proof.plan_at_creation.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Score + Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0, borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '2rem 2.5rem', borderRight: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gris-4)', marginBottom: '0.75rem' }}>
                Analyse IA — Claude (Anthropic)
              </div>
              <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--gris-5)', lineHeight: '1.85' }}>
                {proof.analysis?.summary}
              </p>
              {proof.analysis?.work_category && (
                <div style={{ marginTop: '1rem', fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', color: 'var(--gris-4)' }}>
                  Catégorie : <span style={{ color: 'var(--encre)' }}>{proof.analysis.work_category}</span>
                </div>
              )}
              {proof.analysis?.estimated_duration && (
                <div style={{ marginTop: '4px', fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', color: 'var(--gris-4)' }}>
                  Durée estimée : <span style={{ color: 'var(--encre)' }}>{proof.analysis.estimated_duration}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '140px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '4rem', fontWeight: 300, lineHeight: 1, color: statusColor }}>
                {score}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gris-4)', marginTop: '6px', textAlign: 'center' }}>
                Score de<br />crédibilité
              </div>
              <div style={{ marginTop: '1rem', fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', border: `0.5px solid ${statusColor}`, color: statusColor, background: statusBg }}>
                {label}
              </div>
            </div>
          </div>

          {/* Steps */}
          {proof.analysis?.steps && proof.analysis.steps.length > 0 && (
            <div style={{ padding: '2rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gris-4)', marginBottom: '1.25rem' }}>
                Étapes vérifiées
              </div>
              <div>
                {proof.analysis.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', paddingBottom: i < proof.analysis.steps.length - 1 ? '1rem' : 0, marginBottom: i < proof.analysis.steps.length - 1 ? '1rem' : 0, borderBottom: i < proof.analysis.steps.length - 1 ? '0.5px solid rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ width: '20px', height: '20px', border: `0.5px solid ${step.verified ? statusColor : 'rgba(0,0,0,0.14)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '8px', color: step.verified ? statusColor : 'var(--gris-3)' }}>
                        {step.verified ? '✓' : '○'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', fontWeight: 500, marginBottom: '3px' }}>{step.title}</div>
                      <div style={{ fontSize: '13px', fontWeight: 300, color: 'var(--gris-5)', lineHeight: '1.7' }}>{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human signals */}
          {proof.analysis?.human_signals && proof.analysis.human_signals.length > 0 && (
            <div style={{ padding: '2rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gris-4)', marginBottom: '1.25rem' }}>
                Signaux humains détectés
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {proof.analysis.human_signals.map((sig, i) => (
                  <div key={i} style={{ padding: '10px 12px', border: `0.5px solid ${sig.detected ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}`, background: sig.detected ? 'var(--blanc)' : 'var(--gris-1)', opacity: sig.detected ? 1 : 0.55 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', fontWeight: 500 }}>{sig.label}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', color: sig.detected ? statusColor : 'var(--gris-3)' }}>
                        {sig.detected ? '✓' : '—'}
                      </div>
                    </div>
                    {sig.note && (
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', color: 'var(--gris-4)', lineHeight: '1.5' }}>{sig.note}</div>
                    )}
                    <div style={{ marginTop: '6px', height: '2px', background: 'var(--gris-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: sig.detected ? statusColor : 'var(--gris-3)', width: `${sig.confidence * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URL metadata */}
          {proof.analysis?.url_metadata && (
            <div style={{ padding: '1.5rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gris-4)', marginBottom: '0.75rem' }}>
                Métadonnées URL
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', fontWeight: 300 }}>
                {proof.analysis.url_metadata.title && <div><span style={{ color: 'var(--gris-4)' }}>Titre : </span>{proof.analysis.url_metadata.title}</div>}
                {proof.analysis.url_metadata.domain && <div><span style={{ color: 'var(--gris-4)' }}>Domaine : </span>{proof.analysis.url_metadata.domain}</div>}
                {proof.analysis.url_metadata.last_modified && <div><span style={{ color: 'var(--gris-4)' }}>Modifié le : </span>{proof.analysis.url_metadata.last_modified}</div>}
              </div>
            </div>
          )}

          {/* Keywords */}
          {proof.analysis?.keywords && proof.analysis.keywords.length > 0 && (
            <div style={{ padding: '1.5rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gris-4)', marginBottom: '0.75rem' }}>
                Mots-clés
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {proof.analysis.keywords.map((kw) => (
                  <span key={kw} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', padding: '3px 10px', border: '0.5px solid rgba(0,0,0,0.1)', color: 'var(--gris-5)', background: 'var(--gris-1)' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          {proof.analysis?.flags && proof.analysis.flags.length > 0 && (
            <div style={{ padding: '1.5rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', background: 'rgba(201,2,13,0.02)' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--rouge)', marginBottom: '0.75rem' }}>
                Points d'attention
              </div>
              {proof.analysis.flags.map((flag, i) => (
                <div key={i} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', color: 'var(--rouge)', opacity: 0.8, padding: '3px 0' }}>
                  — {flag}
                </div>
              ))}
            </div>
          )}

          {/* Seal / footer */}
          <div style={{ padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '7px', textAlign: 'center', lineHeight: '1.5', color: 'var(--gris-5)' }}>PRF<br />✓</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', color: 'var(--gris-4)', lineHeight: '1.9' }}>
                Certifié par intelligence artificielle · Immuable depuis sa création · {formatDate(proof.created_at)}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '8px', color: 'var(--gris-3)', marginTop: '3px', wordBreak: 'break-all' }}>
                SHA-256 : {proof.content_hash}
              </div>
            </div>
          </div>
        </div>

        {/* File link */}
        {proof.file_url && (
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', border: '0.5px solid rgba(0,0,0,0.07)', background: 'var(--blanc)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gris-4)' }}>Fichier source</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', marginTop: '3px' }}>{proof.type.toUpperCase()}</div>
            </div>
            <a href={proof.file_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: 'var(--encre)', textDecoration: 'none', padding: '7px 16px', border: '0.5px solid rgba(0,0,0,0.2)' }}>
              Consulter →
            </a>
          </div>
        )}
        {proof.source_url && (
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', border: '0.5px solid rgba(0,0,0,0.07)', background: 'var(--blanc)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gris-4)' }}>URL certifiée</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{proof.source_url}</div>
            </div>
            <a href={proof.source_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: 'var(--encre)', textDecoration: 'none', padding: '7px 16px', border: '0.5px solid rgba(0,0,0,0.2)' }}>
              Ouvrir →
            </a>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: '3rem', padding: '2rem', border: '0.5px solid rgba(0,0,0,0.07)', background: 'var(--blanc)', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 300, marginBottom: '0.5rem' }}>
            Certifiez votre travail
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '11px', color: 'var(--gris-4)', marginBottom: '1.5rem' }}>
            3 certifications gratuites · Pas de carte requise
          </div>
          <Link href="/" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '12px', letterSpacing: '0.08em', background: 'var(--encre)', color: 'var(--blanc)', padding: '12px 32px', textDecoration: 'none' }}>
            Commencer sur Proofly →
          </Link>
        </div>
      </main>
    </div>
  )
}

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, border: '1.5px solid var(--encre)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: size * 0.43, height: size * 0.43, border: '1.5px solid var(--encre)', borderRadius: '50%' }} />
    </div>
  )
}
