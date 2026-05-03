'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { sha256, generateProofId, fileToBase64, extractVideoFrame } from '@/lib/utils'

type ProofType = 'text'|'image'|'pdf'|'video'|'url'
type Step = 'type'|'content'|'analyzing'|'done'

const TYPE_OPTIONS: {id:ProofType;label:string;desc:string}[] = [
  {id:'text', label:'Texte',  desc:'Description, rapport, contenu écrit'},
  {id:'image',label:'Image',  desc:'Capture d\'écran, maquette, visuel'},
  {id:'pdf',  label:'PDF',    desc:'Document, présentation, livrable'},
  {id:'video',label:'Vidéo', desc:'Enregistrement, démo, tutoriel'},
  {id:'url',  label:'URL',    desc:'Site web, portfolio, publication'},
]

export default function NewPage() {
  const [step, setStep]       = useState<Step>('type')
  const [type, setType]       = useState<ProofType|null>(null)
  const [title, setTitle]     = useState('')
  const [text, setText]       = useState('')
  const [url, setUrl]         = useState('')
  const [file, setFile]       = useState<File|null>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [certId, setCertId]   = useState('')
  const [error, setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileDrop = useCallback((e:React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  async function handleSubmit() {
    if (!type || !title.trim()) { setError('Veuillez renseigner un titre.'); return }
    setError(''); setStep('analyzing'); setProgress(10)

    try {
      const {data:{user}} = await supabase.auth.getUser()
      if (!user) { window.location.href='/'; return }

      setProgress(20)

      // Prepare content for hash + analysis
      let contentForHash = ''
      let analysisPayload: Record<string, unknown> = { type, title }

      if (type === 'text') {
        contentForHash = text
        analysisPayload.text = text
      } else if (type === 'url') {
        contentForHash = url
        analysisPayload.url = url
      } else if (file) {
        contentForHash = `${file.name}-${file.size}-${file.lastModified}`

        if (type === 'video') {
          setProgress(30)
          const frame = await extractVideoFrame(file)
          analysisPayload.image_base64 = frame.base64
          analysisPayload.image_mime   = frame.mimeType
          analysisPayload.filename     = file.name
        } else {
          const b64 = await fileToBase64(file)
          analysisPayload.file_base64 = b64
          analysisPayload.file_mime   = file.type
          analysisPayload.filename    = file.name
        }

        // Upload to Supabase Storage
        setProgress(40)
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        await supabase.storage.from('proofs').upload(path, file)
        const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(path)
        analysisPayload.file_url = urlData.publicUrl
      }

      setProgress(50)
      const hash = await sha256(contentForHash || JSON.stringify(analysisPayload))
      const id   = generateProofId()

      // Call AI analysis
      setProgress(60)
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, payload: analysisPayload }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur lors de l\'analyse')
      }

      setProgress(80)
      const { analysis } = await res.json()

      // Save to DB
      setProgress(90)
      const { error: dbErr } = await supabase.from('proofs').insert({
        id,
        user_id: user.id,
        title,
        type,
        content_hash: hash,
        analysis,
        credibility_score: analysis.credibility_score,
        source_url: type==='url' ? url : null,
        file_url: analysisPayload.file_url || null,
      })

      if (dbErr) throw new Error(dbErr.message)

      setProgress(100)
      setCertId(id)
      setStep('done')

    } catch (e: unknown) {
      setStep('content')
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.')
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--creme)',fontFamily:"'IBM Plex Sans',sans-serif"}}>
      {/* Nav */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(250,250,248,0.94)',backdropFilter:'blur(8px)',borderBottom:'0.5px solid rgba(0,0,0,0.07)'}}>
        <div style={{maxWidth:'960px',margin:'0 auto',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'56px'}}>
          <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none',color:'inherit'}}>
            <LogoMark />
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'17px',fontWeight:500,letterSpacing:'0.05em'}}>Proofly</span>
          </Link>
          <Link href="/dashboard" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gris-4)',textDecoration:'none'}}>
            ← Retour
          </Link>
        </div>
      </nav>

      <main style={{maxWidth:'640px',margin:'0 auto',padding:'100px 2rem 4rem'}}>
        {/* Steps indicator */}
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3rem'}}>
          {['type','content','analyzing','done'].map((s,i,arr) => (
            <div key={s} style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{
                width:'24px',height:'24px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',
                background:step===s?'var(--encre)':['done','analyzing'].includes(step)&&i<arr.indexOf(step)?'var(--encre)':'transparent',
                color:step===s||(['done','analyzing'].includes(step)&&i<arr.indexOf(step))?'var(--blanc)':'var(--gris-3)',
                border:`0.5px solid ${step===s?'var(--encre)':['done','analyzing'].includes(step)&&i<arr.indexOf(step)?'var(--encre)':'rgba(0,0,0,0.12)'}`,
                transition:'all 0.2s',
              }}>
                {i+1}
              </div>
              {i<arr.length-1 && <div style={{width:'24px',height:'0.5px',background:'rgba(0,0,0,0.1)'}} />}
            </div>
          ))}
        </div>

        {/* STEP 1: Type selection */}
        {step==='type' && (
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'0.75rem'}}>
              Étape 1 — Type de livrable
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2.2rem',fontWeight:300,marginBottom:'2rem'}}>
              Quel type de travail<br/><em>certifiez-vous ?</em>
            </h1>
            <div style={{border:'0.5px solid rgba(0,0,0,0.07)'}}>
              {TYPE_OPTIONS.map((t,i) => (
                <div
                  key={t.id}
                  onClick={()=>{setType(t.id);setStep('content')}}
                  style={{
                    padding:'1rem 1.25rem',
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    background:type===t.id?'var(--gris-1)':'var(--blanc)',
                    borderBottom:i<TYPE_OPTIONS.length-1?'0.5px solid rgba(0,0,0,0.06)':'none',
                    cursor:'pointer',transition:'background 0.15s',
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--gris-1)')}
                  onMouseLeave={e=>(e.currentTarget.style.background=type===t.id?'var(--gris-1)':'var(--blanc)')}
                >
                  <div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',fontWeight:400}}>{t.label}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',color:'var(--gris-4)',marginTop:'2px'}}>{t.desc}</div>
                  </div>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'12px',color:'var(--gris-3)'}}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Content */}
        {step==='content' && type && (
          <div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'0.75rem'}}>
              Étape 2 — Contenu · <button onClick={()=>setStep('type')} style={{background:'none',border:'none',cursor:'pointer',fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--bleu)',padding:0}}>{TYPE_OPTIONS.find(t=>t.id===type)?.label}</button>
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2.2rem',fontWeight:300,marginBottom:'2rem'}}>
              Décrivez votre<br/><em>livrable.</em>
            </h1>

            {error && (
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'11px',padding:'10px 14px',marginBottom:'1.5rem',borderLeft:'2px solid var(--rouge)',color:'var(--rouge)',background:'rgba(201,2,13,0.04)'}}>
                {error}
              </div>
            )}

            {/* Title - always */}
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'6px'}}>
                Titre du livrable *
              </div>
              <input
                type="text" value={title} onChange={e=>setTitle(e.target.value)}
                className="input" placeholder="Ex : Refonte UX plateforme SaaS B2B"
                style={{borderRadius:0}}
              />
            </div>

            {/* Content by type */}
            {type==='text' && (
              <div style={{marginBottom:'1.25rem'}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'6px'}}>Contenu</div>
                <textarea value={text} onChange={e=>setText(e.target.value)} className="input" style={{borderRadius:0,minHeight:'160px',resize:'vertical'}} placeholder="Décrivez votre travail en détail…" />
              </div>
            )}

            {type==='url' && (
              <div style={{marginBottom:'1.25rem'}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'6px'}}>URL</div>
                <input type="url" value={url} onChange={e=>setUrl(e.target.value)} className="input" style={{borderRadius:0}} placeholder="https://…" />
              </div>
            )}

            {['image','pdf','video'].includes(type) && (
              <div style={{marginBottom:'1.25rem'}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'6px'}}>Fichier</div>
                <div
                  className={`upload-zone${dragging?' active':''}`}
                  style={{padding:'3rem',textAlign:'center'}}
                  onDrop={handleFileDrop}
                  onDragOver={e=>{e.preventDefault();setDragging(true)}}
                  onDragLeave={()=>setDragging(false)}
                  onClick={()=>fileRef.current?.click()}
                >
                  <input
                    ref={fileRef} type="file" style={{display:'none'}}
                    accept={type==='image'?'image/*':type==='pdf'?'.pdf':type==='video'?'video/*':'*'}
                    onChange={e=>e.target.files?.[0]&&setFile(e.target.files[0])}
                  />
                  {file ? (
                    <div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:400}}>{file.name}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',color:'var(--gris-4)',marginTop:'4px'}}>{(file.size/1024/1024).toFixed(2)} MB</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.2rem',fontWeight:300,color:'var(--gris-4)'}}>
                        Déposer ou cliquer pour choisir
                      </div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',color:'var(--gris-3)',marginTop:'6px',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                        {type==='image'?'PNG, JPG, WEBP, SVG':type==='pdf'?'PDF':'MP4, MOV, WEBM'} · Max 50 MB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'12px',letterSpacing:'0.08em',background:'var(--encre)',color:'var(--blanc)',padding:'14px 36px',border:'none',cursor:'pointer',width:'100%',marginTop:'1rem'}}
            >
              Analyser et certifier →
            </button>
          </div>
        )}

        {/* STEP 3: Analyzing */}
        {step==='analyzing' && (
          <div style={{textAlign:'center',padding:'4rem 0'}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'2rem'}}>
              Analyse en cours
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2.5rem',fontWeight:300,marginBottom:'3rem'}}>
              L'IA examine<br/><em>votre travail…</em>
            </h1>

            {/* Progress */}
            <div style={{maxWidth:'300px',margin:'0 auto 2rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',color:'var(--gris-4)',letterSpacing:'0.15em',textTransform:'uppercase'}}>Progression</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',color:'var(--gris-4)'}}>{progress}%</span>
              </div>
              <div style={{height:'1px',background:'var(--gris-2)',overflow:'hidden'}}>
                <div style={{height:'100%',background:'var(--encre)',width:`${progress}%`,transition:'width 0.4s ease'}} />
              </div>
            </div>

            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'11px',color:'var(--gris-4)',lineHeight:'2'}}>
              {progress<30 && '— Préparation du contenu'}
              {progress>=30&&progress<50 && '— Upload vers le stockage sécurisé'}
              {progress>=50&&progress<60 && '— Génération de l\'empreinte SHA-256'}
              {progress>=60&&progress<80 && '— Analyse IA par Claude (Anthropic)'}
              {progress>=80&&progress<90 && '— Évaluation des signaux humains'}
              {progress>=90 && '— Enregistrement du certificat'}
            </div>
          </div>
        )}

        {/* STEP 4: Done */}
        {step==='done' && (
          <div style={{textAlign:'center',padding:'3rem 0'}}>
            <div style={{width:'60px',height:'60px',border:'1px solid var(--vert)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 2rem'}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'16px',color:'var(--vert)'}}>✓</span>
            </div>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--gris-4)',marginBottom:'0.75rem'}}>
              Certificat émis
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'2.5rem',fontWeight:300,marginBottom:'0.5rem'}}>
              <em>{title}</em>
            </h1>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'14px',color:'var(--gris-4)',marginBottom:'3rem'}}>
              {certId}
            </div>

            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
              <Link href={`/cert/${certId}`} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'12px',letterSpacing:'0.08em',background:'var(--encre)',color:'var(--blanc)',padding:'14px 32px',textDecoration:'none'}}>
                Voir le certificat →
              </Link>
              <button
                onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/cert/${certId}`)}}
                style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'12px',letterSpacing:'0.08em',background:'transparent',color:'var(--encre)',padding:'14px 32px',border:'0.5px solid rgba(0,0,0,0.28)',cursor:'pointer'}}
              >
                Copier le lien
              </button>
            </div>

            <div style={{marginTop:'2rem'}}>
              <Link href="/new" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gris-4)',textDecoration:'none'}}>
                + Nouveau certificat
              </Link>
            </div>
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
