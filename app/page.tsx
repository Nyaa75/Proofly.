'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const PLANS = [
  {
    id:'free', name:'Gratuit', price:'0€', period:'',
    desc:'Pour découvrir',
    features:['3 certifications à vie','Analyse IA standard','Page publique partageable','Badge Proofly'],
    cta:'Commencer gratuitement', featured:false,
  },
  {
    id:'pro', name:'Pro', price:'9€', period:'/mois',
    desc:'Pour les freelances actifs',
    features:['50 certifications / mois','Analyse IA approfondie','Signaux humains détaillés','Export PDF certifié','Badge vérifié'],
    cta:'Passer à Pro', featured:true,
  },
  {
    id:'agency', name:'Agency', price:'29€', period:'/mois',
    desc:'Pour les agences & studios',
    features:['Certifications illimitées','Multi-clients & projets','API access (bientôt)','Rapport mensuel','Support prioritaire'],
    cta:'Contacter', featured:false,
  },
]

export default function Home() {
  const [user, setUser] = useState<{email:string}|null>(null)
  const [modal, setModal] = useState(false)
  const [mode, setMode] = useState<'login'|'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({data}) => { if (data.user) setUser({email:data.user.email||''}) })
  }, [])

  async function handleAuth(e:React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg('')
    if (mode === 'signup') {
      const {error} = await supabase.auth.signUp({email, password, options:{emailRedirectTo:`${window.location.origin}/auth/callback`}})
      if (error) setMsg(error.message); else setMsg('Vérifiez votre email pour confirmer votre compte.')
    } else {
      const {error} = await supabase.auth.signInWithPassword({email, password})
      if (error) setMsg(error.message); else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({provider:'google', options:{redirectTo:`${window.location.origin}/auth/callback`}})
  }

  async function handleCheckout(planId:string) {
    if (!user) { setModal(true); setMode('signup'); return }
    if (planId === 'free') { window.location.href = '/dashboard'; return }
    if (planId === 'agency') { window.open('mailto:hello@proofly.app?subject=Agency','_blank'); return }
    const res = await fetch('/api/stripe/checkout', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({plan:planId})})
    const {url} = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="min-h-screen bg-creme font-sans">

      {/* Nav */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(250,250,248,0.94)',backdropFilter:'blur(8px)',borderBottom:'0.5px solid rgba(0,0,0,0.07)'}}>
        <div style={{maxWidth:'960px',margin:'0 auto',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'56px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <LogoMark />
            <span className="font-serif" style={{fontSize:'17px',fontWeight:500,letterSpacing:'0.05em'}}>Proofly</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'24px'}}>
            <a href="#tarifs" className="label" style={{cursor:'pointer',textDecoration:'none',color:'var(--gris-4)'}}>Tarifs</a>
            {user ? (
              <>
                <Link href="/dashboard" className="label" style={{color:'var(--gris-4)'}}>Dashboard</Link>
                <Link href="/new" className="btn btn-primary btn-sm">Certifier →</Link>
              </>
            ) : (
              <>
                <button onClick={()=>{setModal(true);setMode('login')}} className="label" style={{cursor:'pointer',background:'none',border:'none',color:'var(--gris-4)'}}>Connexion</button>
                <button onClick={()=>{setModal(true);setMode('signup')}} className="btn btn-primary btn-sm">Commencer →</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{paddingTop:'140px',paddingBottom:'100px',maxWidth:'960px',margin:'0 auto',padding:'140px 2rem 100px'}}>
        <div className="label fade-up" style={{marginBottom:'2rem'}}>Certification de travail · Authentifié par IA</div>
        <h1 className="font-serif fade-up delay-1" style={{fontSize:'clamp(3rem,8vw,5.5rem)',fontWeight:300,lineHeight:1.05,letterSpacing:'-0.015em',marginBottom:'2rem',maxWidth:'700px'}}>
          Votre travail,<br/><em>certifié.</em>
        </h1>
        <p className="fade-up delay-2" style={{fontSize:'16px',fontWeight:300,color:'var(--gris-5)',maxWidth:'480px',lineHeight:'1.8',marginBottom:'3rem'}}>
          Un identifiant unique, une analyse d'authenticité IA, une page publique immuable. Partagez la preuve concrète de ce que vous avez accompli.
        </p>
        <div className="fade-up delay-3" style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          {user
            ? <Link href="/new" className="btn btn-primary btn-lg">Créer un certificat →</Link>
            : <button onClick={()=>{setModal(true);setMode('signup')}} className="btn btn-primary btn-lg">Commencer gratuitement →</button>
          }
          <a href="#exemple" className="btn btn-ghost btn-lg">Voir un exemple</a>
        </div>

        {/* Stats row */}
        <div className="fade-up delay-4" style={{marginTop:'5rem',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0',borderTop:'0.5px solid rgba(0,0,0,0.07)',borderLeft:'0.5px solid rgba(0,0,0,0.07)'}}>
          {[
            {v:'12 847',l:'Certifications émises'},
            {v:'< 30s',l:"Temps d'analyse IA"},
            {v:'4 200+',l:'Freelances actifs'},
          ].map((s,i) => (
            <div key={i} style={{padding:'1.5rem',borderRight:'0.5px solid rgba(0,0,0,0.07)',borderBottom:'0.5px solid rgba(0,0,0,0.07)'}}>
              <div className="font-serif" style={{fontSize:'2rem',fontWeight:300}}>{s.v}</div>
              <div className="label" style={{marginTop:'4px'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="sep" />

      {/* Certificate example */}
      <section id="exemple" style={{maxWidth:'960px',margin:'0 auto',padding:'6rem 2rem'}}>
        <div className="label" style={{marginBottom:'2rem'}}>Exemple de certificat</div>
        <CertExample />
      </section>

      <div className="sep" />

      {/* How it works */}
      <section style={{maxWidth:'960px',margin:'0 auto',padding:'6rem 2rem'}}>
        <div className="label" style={{marginBottom:'2rem'}}>Comment ça marche</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0',border:'0.5px solid rgba(0,0,0,0.07)'}}>
          {[
            {n:'01',t:'Uploadez votre livrable',d:"Texte, image, PDF, vidéo ou URL. N'importe quel format."},
            {n:'02',t:"L'IA analyse et certifie",d:"Claude examine le contenu, détecte les signaux humains, calcule un score de crédibilité."},
            {n:'03',t:'Partagez la preuve',d:"Un ID unique PRF-XXXX, un lien public immuable, des méta OG pour LinkedIn."},
          ].map((s,i) => (
            <div key={i} style={{padding:'2rem',borderRight:i<2?'0.5px solid rgba(0,0,0,0.07)':'none'}}>
              <div className="font-mono" style={{fontSize:'11px',color:'var(--gris-3)',marginBottom:'1.5rem'}}>{s.n}</div>
              <h3 className="font-serif" style={{fontSize:'1.4rem',fontWeight:400,marginBottom:'0.75rem'}}>{s.t}</h3>
              <p style={{fontSize:'13px',fontWeight:300,color:'var(--gris-5)',lineHeight:'1.7'}}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="sep" />

      {/* Pricing */}
      <section id="tarifs" style={{maxWidth:'960px',margin:'0 auto',padding:'6rem 2rem'}}>
        <div className="label" style={{marginBottom:'2rem'}}>Tarifs</div>
        <h2 className="font-serif" style={{fontSize:'2.8rem',fontWeight:300,marginBottom:'3rem'}}>Simple, transparent.</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0',border:'0.5px solid rgba(0,0,0,0.14)'}}>
          {PLANS.map((plan,i) => (
            <div
              key={plan.id}
              style={{
                padding:'2rem',
                borderRight:i<2?'0.5px solid rgba(0,0,0,0.14)':'none',
                background:plan.featured?'var(--encre)':'var(--blanc)',
                color:plan.featured?'var(--blanc)':undefined,
              }}
            >
              <div className="font-mono" style={{fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:plan.featured?'rgba(255,255,255,0.5)':'var(--gris-4)',marginBottom:'1.5rem'}}>{plan.name}</div>
              <div className="font-serif" style={{fontSize:'2.8rem',fontWeight:300,lineHeight:1,marginBottom:'0.25rem'}}>{plan.price}</div>
              {plan.period && <div style={{fontSize:'13px',fontWeight:300,color:plan.featured?'rgba(255,255,255,0.5)':'var(--gris-4)',marginBottom:'1.5rem'}}>{plan.period}</div>}
              <ul style={{listStyle:'none',padding:0,marginBottom:'2rem',borderTop:`0.5px solid ${plan.featured?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.07)'}`,paddingTop:'1.25rem'}}>
                {plan.features.map(f => (
                  <li key={f} style={{fontSize:'13px',fontWeight:300,padding:'5px 0',color:plan.featured?'rgba(255,255,255,0.8)':'var(--gris-5)',borderBottom:`0.5px solid ${plan.featured?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'}`}}>
                    — {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={()=>handleCheckout(plan.id)}
                className="btn"
                style={{
                  width:'100%', padding:'10px 0', fontSize:'11px', letterSpacing:'0.08em',
                  background:plan.featured?'rgba(255,255,255,0.12)':'var(--encre)',
                  color:plan.featured?'var(--blanc)':'var(--blanc)',
                  border:`0.5px solid ${plan.featured?'rgba(255,255,255,0.25)':'transparent'}`,
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'0.5px solid rgba(0,0,0,0.07)',padding:'3rem 2rem'}}>
        <div style={{maxWidth:'960px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <LogoMark />
            <span className="font-serif" style={{fontSize:'15px',fontWeight:400}}>Proofly</span>
            <span className="font-mono" style={{fontSize:'10px',color:'var(--gris-3)'}}>v1.0</span>
          </div>
          <div style={{display:'flex',gap:'2rem'}}>
            {['CGU','Confidentialité','Contact'].map(l => (
              <a key={l} href="#" className="label" style={{textDecoration:'none'}}>{l}</a>
            ))}
          </div>
          <div className="font-mono" style={{fontSize:'10px',color:'var(--gris-4)'}}>
            © {new Date().getFullYear()} Proofly
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {modal && (
        <div
          style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'rgba(250,250,248,0.7)',backdropFilter:'blur(4px)'}}
          onClick={e => e.target===e.currentTarget && setModal(false)}
        >
          <div style={{background:'var(--blanc)',border:'0.5px solid rgba(0,0,0,0.14)',padding:'2.5rem',width:'100%',maxWidth:'400px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem'}}>
              <div>
                <LogoMark />
                <h2 className="font-serif" style={{fontSize:'1.6rem',fontWeight:300,marginTop:'1rem'}}>{mode==='signup'?'Créer un compte':'Connexion'}</h2>
              </div>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'var(--gris-4)',lineHeight:1}}>✕</button>
            </div>

            <button onClick={handleGoogle} className="btn btn-ghost" style={{width:'100%',marginBottom:'1.5rem',gap:'10px',justifyContent:'center'}}>
              <GoogleIcon /> Continuer avec Google
            </button>

            <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
              <div className="sep" style={{flex:1}} />
              <span className="label">ou</span>
              <div className="sep" style={{flex:1}} />
            </div>

            <form onSubmit={handleAuth}>
              <div style={{marginBottom:'1rem'}}>
                <div className="label" style={{marginBottom:'6px'}}>Email</div>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" placeholder="vous@exemple.com" required />
              </div>
              <div style={{marginBottom:'1.5rem'}}>
                <div className="label" style={{marginBottom:'6px'}}>Mot de passe</div>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={8} />
              </div>
              {msg && (
                <div className="font-mono" style={{fontSize:'11px',padding:'10px 12px',marginBottom:'1rem',borderLeft:'2px solid',borderLeftColor:msg.includes('Vérifiez')?'var(--vert)':'var(--rouge)',color:msg.includes('Vérifiez')?'var(--vert)':'var(--rouge)',background:msg.includes('Vérifiez')?'rgba(0,107,62,0.04)':'rgba(201,2,13,0.04)'}}>
                  {msg}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary" style={{width:'100%'}}>
                {loading ? '...' : mode==='signup'?'Créer mon compte':'Se connecter'}
              </button>
            </form>

            <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:'12px',color:'var(--gris-4)'}}>
              {mode==='signup'?'Déjà un compte ?':'Pas encore de compte ?'}{' '}
              <button onClick={()=>{setMode(mode==='signup'?'login':'signup');setMsg('')}} style={{background:'none',border:'none',cursor:'pointer',fontSize:'12px',color:'var(--encre)',textDecoration:'underline'}}>
                {mode==='signup'?'Se connecter':'Créer un compte'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function LogoMark({size=28}:{size?:number}) {
  return (
    <div style={{width:size,height:size,border:'1.5px solid var(--encre)',borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <div style={{width:size*0.43,height:size*0.43,border:'1.5px solid var(--encre)',borderRadius:'50%'}} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function CertExample() {
  return (
    <div style={{border:'0.5px solid rgba(0,0,0,0.14)',background:'var(--blanc)'}}>
      <div style={{padding:'2rem 2rem 1.5rem',borderBottom:'0.5px solid rgba(0,0,0,0.07)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <div className="label" style={{marginBottom:'0.75rem'}}>Certificat d'authenticité · Proofly</div>
          <h2 className="font-serif" style={{fontSize:'2rem',fontWeight:300,lineHeight:1.15}}>Refonte UX<br/>Plateforme SaaS B2B</h2>
          <p style={{fontSize:'13px',fontWeight:300,color:'var(--gris-5)',marginTop:'0.5rem',fontStyle:'italic'}}>Délivré à Marie Dupont · UX Designer Freelance</p>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="font-mono" style={{fontSize:'13px',fontWeight:500}}>PRF-A7K2M9BX</div>
          <div className="font-mono" style={{fontSize:'10px',color:'var(--gris-4)',marginTop:'4px'}}>14 jan. 2025 · 09:47 UTC</div>
          <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px'}}>
            <span className="pill pill-verified">✓ Vérifié</span>
            <span className="pill pill-type">Image / Design</span>
          </div>
        </div>
      </div>
      <div style={{padding:'1.5rem 2rem',display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem',borderBottom:'0.5px solid rgba(0,0,0,0.07)'}}>
        <div>
          <div className="label" style={{marginBottom:'0.75rem'}}>Analyse IA</div>
          <p style={{fontSize:'13px',fontWeight:300,color:'var(--gris-5)',lineHeight:'1.8'}}>Le livrable présente une architecture d'information cohérente avec des parcours utilisateur documentés. Les signaux d'authenticité humaine sont forts : itérations visibles, annotations contextuelles, progression stylistique mesurable sur 6 semaines.</p>
        </div>
        <div style={{border:'0.5px solid rgba(0,0,0,0.07)',padding:'1.25rem',textAlign:'center'}}>
          <div className="font-serif" style={{fontSize:'3.5rem',fontWeight:300,lineHeight:1}}>94</div>
          <div className="label" style={{marginTop:'8px'}}>Score de crédibilité</div>
        </div>
      </div>
      <div style={{padding:'1.25rem 2rem',display:'flex',alignItems:'center',gap:'1rem'}}>
        <div style={{width:'44px',height:'44px',border:'1px solid rgba(0,0,0,0.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span className="font-mono" style={{fontSize:'7px',textAlign:'center',lineHeight:'1.3',color:'var(--gris-4)'}}>PRF<br/>✓</span>
        </div>
        <div>
          <div className="font-mono" style={{fontSize:'9px',color:'var(--gris-4)',lineHeight:'1.7'}}>Certifié par intelligence artificielle · Immuable depuis sa création</div>
          <div className="font-mono" style={{fontSize:'9px',color:'var(--gris-3)'}}>SHA-256 : a7f3b2c8d4e1f9b6c3d2a8e5f1b4c7d9e2f3a6b8c1d4e7f0a3b5c8d1e4f7a0b2c5</div>
        </div>
      </div>
    </div>
  )
}
