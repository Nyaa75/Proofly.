import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--creme)', fontFamily: "'IBM Plex Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gris-4)', marginBottom: '1rem' }}>
          Erreur 404
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '3rem', fontWeight: 300, marginBottom: '1rem' }}>
          Certificat introuvable
        </h1>
        <p style={{ fontSize: '14px', fontWeight: 300, color: 'var(--gris-5)', marginBottom: '2.5rem' }}>
          Ce certificat n'existe pas ou a été supprimé.
        </p>
        <Link href="/" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '12px', letterSpacing: '0.08em', background: 'var(--encre)', color: 'var(--blanc)', padding: '12px 32px', textDecoration: 'none' }}>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
