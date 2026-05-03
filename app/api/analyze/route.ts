import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { ProofAnalysis } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Tu es un expert en certification et authentification de travaux freelances.
Ton rôle est d'analyser un livrable professionnel et de produire une évaluation structurée de son authenticité.

Tu dois retourner UNIQUEMENT un objet JSON valide sans markdown, sans backticks, sans texte autour.

Structure JSON attendue :
{
  "summary": "Résumé en 2-3 phrases de ce que représente ce livrable",
  "credibility_score": <entier 0-100>,
  "work_category": "Catégorie du travail (ex: Design UX, Développement Web, Consulting...)",
  "estimated_duration": "Durée estimée du travail (ex: 2-3 semaines)",
  "steps": [
    {
      "step": 1,
      "title": "Titre court de l'étape",
      "description": "Description de ce qui a été vérifié",
      "verified": <true|false>
    }
  ],
  "human_signals": [
    {
      "label": "Nom du signal",
      "detected": <true|false>,
      "confidence": <float 0-1>,
      "note": "Observation courte"
    }
  ],
  "keywords": ["mot1", "mot2", "mot3"],
  "flags": ["Point d'attention si problème, sinon tableau vide"],
  "recommendation": "<verified|likely_authentic|inconclusive|suspicious>"
}

Signaux humains à évaluer : Itérations visibles, Annotations contextuelles, Cohérence stylistique, Progression temporelle, Spécificité métier, Erreurs naturelles, Contexte client, Propriété intellectuelle.

Critères de score :
- 80-100 : Travail clairement authentique, signes humains multiples
- 60-79  : Probablement authentique, quelques ambiguïtés
- 40-59  : Incertain, manque de preuves suffisantes
- 0-39   : Suspect ou insuffisant

Sois rigoureux, professionnel et objectif. Réponds uniquement en français.`

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Freemium limit check (server-side)
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    const plan = sub?.status === 'active' ? sub.plan : 'free'
    const limit = plan === 'free' ? 3 : plan === 'pro' ? 50 : Infinity

    if (isFinite(limit)) {
      // Count proofs this month for pro, or all time for free
      let countQuery = supabase.from('proofs').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      if (plan === 'pro') {
        const start = new Date()
        start.setDate(1); start.setHours(0, 0, 0, 0)
        countQuery = countQuery.gte('created_at', start.toISOString())
      }
      const { count } = await countQuery
      if ((count || 0) >= limit) {
        return NextResponse.json({ error: `Limite atteinte (${limit} certifications). Passez à un plan supérieur.` }, { status: 403 })
      }
    }

    const { type, title, payload } = await req.json()

    // Build messages for Claude
    const messages: Anthropic.MessageParam[] = []
    const userContent: Anthropic.ContentBlockParam[] = []

    // Add text context
    userContent.push({
      type: 'text',
      text: `Analyse ce livrable freelance :\n\nTitre : ${title}\nType : ${type}\n\n`,
    })

    if (type === 'text' && payload.text) {
      userContent.push({ type: 'text', text: `Contenu textuel :\n${payload.text}` })
    }

    if (type === 'url' && payload.url) {
      userContent.push({ type: 'text', text: `URL à analyser : ${payload.url}` })
    }

    if (payload.file_base64 && payload.file_mime) {
      if (payload.file_mime.startsWith('image/')) {
        userContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: payload.file_mime as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: payload.file_base64,
          },
        })
      } else if (payload.file_mime === 'application/pdf') {
        userContent.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: payload.file_base64,
          },
        } as unknown as Anthropic.ContentBlockParam)
      }
    }

    // Video: analyse extracted frame
    if (type === 'video' && payload.image_base64) {
      userContent.push({
        type: 'text',
        text: `Voici une frame extraite d'une vidéo de démonstration (fichier : ${payload.filename}) :`,
      })
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: payload.image_mime as 'image/jpeg',
          data: payload.image_base64,
        },
      })
    }

    messages.push({ role: 'user', content: userContent })

    // Use web_search for URLs
    const tools: Anthropic.Tool[] = type === 'url' ? [
      {
        type: 'web_search_20250305' as unknown as 'custom',
        name: 'web_search',
      } as unknown as Anthropic.Tool,
    ] : []

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages,
      ...(tools.length > 0 ? { tools } : {}),
    })

    // Extract text content from response
    let rawJson = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        rawJson += block.text
      }
    }

    // Clean and parse
    rawJson = rawJson.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const analysis = JSON.parse(rawJson) as ProofAnalysis

    // Validate score bounds
    analysis.credibility_score = Math.max(0, Math.min(100, Math.round(analysis.credibility_score)))

    return NextResponse.json({ analysis, plan })

  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
