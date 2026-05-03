'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Proof } from '@/types'
import { formatDate, scoreToLabel } from '@/lib/utils'

export default function DashboardPage() {
  const [proofs, setProofs] = useState<Proof[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<'free'|'pro'|'agency'>('free')
  const [user, setUser] = useState<{email:string;id:string}|null>(null)
  const [copied, setCopied] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(()=>{
    async function load(){
      const {data:{user:u}} = await supabase.auth.getUser()
      if (!u) { window.location.href='/'; return }
      setUser({email:u.email||'',id:u.id})
      const [{data:pd},{data:sd}] = await Promise.all([
        supabase.from('proofs').select('*').eq('user_id',u.id).order('created_at',{ascending:false}),
        supabase.from('subscriptions').select('plan,status').eq('user_id',u.id).single(),
      ])
      setProofs(pd||[])
      if (sd?.status==='active') setPlan(sd.plan)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  async function handleSignOut() { await supabase.auth.signOut(); window.location.href='/' }

  function copyLink(id:string) {
    navigator.clipboard.writeText(`${window.location.origin}/cert/${id}`)
    setCopied(id); setTimeout(()=>setCopied(null),2000)
  }

  const limit = plan==='free'?3:plan==='pro'?50:Infinity
  const canCreate = proofs.length < limit

  if (loading) return (
    <div style={{minHeight:'100vh',background:'var(--creme)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="label" style={{letterSpacing:'0.25em'}}>Chargement…</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--creme)',fontFamily:"'IBM Plex Sans',sans-serif"}}>
      {/* Nav */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(250,250,248,0.94)',backdropFilter:'blur(8px)',borderBottom:'0.5px solid rgba(0,0,0,0.07)'}}>
        <div style={{maxWidth:'960px',margin:'0 auto',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'56px'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none',color:'inherit'}}>
            <LogoMark />
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontWeight:500,letterSpacing:'0.05em'}}>Proofly</span>
          </Link>
          <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',letterSpacing:'0.15em',textTransform:'uppercase',padding:'3px 8px',border:'0.5px solid rgba(0,0,0,0.14)',color:'var(--gris-5)'}}>
              {plan.toUpperCase()}
            </span>
            {plan==='free' && (
              <Link href="/#tarifs" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'11px',letterSpacing:'0.08em',background:'var(--encre)',color:'var(--blanc)',padding:'7px 16px',textDecoration:'none'}}>
                Passer Pro
              </Link>
            )}
            <button onClick={handleSignOut} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gris-4)',background:'none',border:'none',cursor:'pointer'}}>
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main style={{maxWidth:'960px',margin:'0 auto',padding:'100px 2rem 4rem'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'2.5rem',borderBottom:'0.5px solid rgba(0,0,0,0.07)',paddingBottom:'1.5rem'}}>
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'0.5rem'}}>
              {user?.email}
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2.5rem',fontWeight:300,lineHeight:1.1}}>
              Mes certifications
            </h1>
          </div>
          {canCreate
            ? <Link href="/new" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'11px',letterSpacing:'0.08em',background:'var(--encre)',color:'var(--blanc)',padding:'10px 24px',textDecoration:'none'}}>Nouveau →</Link>
            : <Link href="/#tarifs" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'11px',letterSpacing:'0.08em',background:'var(--encre)',color:'var(--blanc)',padding:'10px 24px',textDecoration:'none'}}>Upgrader →</Link>
          }
        </div>

        {/* Usage bar */}
        {plan!=='agency' && (
          <div style={{marginBottom:'2rem',padding:'1rem 1.25rem',background:'var(--blanc)',border:'0.5px solid rgba(0,0,0,0.07)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gris-4)'}}>
                Quota — {plan==='free'?'3 à vie':'50 / mois'}
              </span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',color:'var(--gris-4)'}}>
                {proofs.length} / {isFinite(limit)?limit:'∞'}
              </span>
            </div>
            <div style={{height:'1px',background:'var(--gris-2)',overflow:'hidden'}}>
              <div style={{height:'100%',background:proofs.length>=limit?'var(--rouge)':'var(--encre)',width:`${Math.min(100,(proofs.length/(isFinite(limit)?limit:1))*100)}%`,transition:'width 0.4s ease'}} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {proofs.length===0 && (
          <div style={{textAlign:'center',padding:'6rem 2rem',border:'0.5px dashed rgba(0,0,0,0.1)'}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.8rem',fontWeight:300,marginBottom:'0.75rem'}}>Aucun certificat</div>
            <p style={{fontSize:'13px',fontWeight:300,color:'var(--gris-5)',marginBottom:'2rem',maxWidth:'360px',margin:'0 auto 2rem',lineHeight:'1.8'}}>
              Certifiez votre premier livrable et partagez une preuve concrète de votre travail.
            </p>
            <Link href="/new" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'12px',letterSpacing:'0.08em',background:'var(--encre)',color:'var(--blanc)',padding:'14px 36px',textDecoration:'none'}}>
              Créer mon premier certificat →
            </Link>
          </div>
        )}

        {/* Grid */}
        {proofs.length>0 && (
          <div style={{border:'0.5px solid rgba(0,0,0,0.07)'}}>
            {proofs.map((proof,i) => (
              <div
                key={proof.id}
                style={{padding:'1.25rem 1.5rem',background:'var(--blanc)',borderBottom:i<proofs.length-1?'0.5px solid rgba(0,0,0,0.06)':'none',display:'flex',alignItems:'center',gap:'1.5rem',transition:'background 0.15s',cursor:'default'}}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--gris-1)')}
                onMouseLeave={e=>(e.currentTarget.style.background='var(--blanc)')}
              >
                {/* Score */}
                <div style={{width:'52px',textAlign:'center',flexShrink:0}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2rem',fontWeight:300,lineHeight:1}}>{proof.credibility_score}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'8px',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gris-4)',marginTop:'2px'}}>/100</div>
                </div>

                {/* Separator */}
                <div style={{width:'0.5px',height:'40px',background:'rgba(0,0,0,0.08)',flexShrink:0}} />

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',color:'var(--gris-3)',marginBottom:'3px'}}>{proof.id}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{proof.title}</div>
                  <div style={{display:'flex',gap:'6px',marginTop:'5px',flexWrap:'wrap'}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'8px',letterSpacing:'0.12em',textTransform:'uppercase',padding:'2px 7px',border:'0.5px solid rgba(0,0,0,0.14)',color:'var(--gris-5)'}}>{proof.type}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'8px',letterSpacing:'0.12em',textTransform:'uppercase',padding:'2px 7px',border:`0.5px solid ${proof.credibility_score>=80?'var(--vert)':proof.credibility_score>=60?'var(--bleu)':'var(--rouge)'}`,color:proof.credibility_score>=80?'var(--vert)':proof.credibility_score>=60?'var(--bleu)':'var(--rouge)'}}>{scoreToLabel(proof.credibility_score)}</span>
                  </div>
                </div>

                {/* Date */}
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',color:'var(--gris-4)',flexShrink:0,display:'none'}}>
                  {formatDate(proof.created_at)}
                </div>

                {/* Actions */}
                <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                  <Link href={`/cert/${proof.id}`} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.08em',padding:'6px 14px',border:'0.5px solid rgba(0,0,0,0.2)',color:'var(--encre)',textDecoration:'none',background:'transparent'}}>
                    Voir
                  </Link>
                  <button onClick={()=>copyLink(proof.id)} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.08em',padding:'6px 14px',border:'0.5px solid rgba(0,0,0,0.2)',color:copied===proof.id?'var(--blanc)':'var(--encre)',background:copied===proof.id?'var(--encre)':'transparent',cursor:'pointer',transition:'all 0.15s'}}>
                    {copied===proof.id?'Copié ✓':'Partager'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function LogoMark() {
  return (
    <div style={{width:28,height:28,border:'1.5px solid var(--encre)',borderRadius:'3px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <div style={{width:12,height:12,border:'1.5px solid var(--encre)',borderRadius:'50%'}} />
    </div>
  )
}
