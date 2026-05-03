export type Plan = 'free' | 'pro' | 'agency'

export type ProofType = 'text' | 'image' | 'pdf' | 'video' | 'url'

export interface HumanSignal {
  label: string
  detected: boolean
  confidence: number
  note?: string
}

export interface ProofStep {
  step: number
  title: string
  description: string
  verified: boolean
}

export interface ProofAnalysis {
  summary: string
  credibility_score: number // 0-100
  steps: ProofStep[]
  human_signals: HumanSignal[]
  keywords: string[]
  work_category: string
  estimated_duration?: string
  url_metadata?: {
    title: string
    description: string
    domain: string
    last_modified?: string
  }
  flags: string[]
  recommendation: 'verified' | 'likely_authentic' | 'inconclusive' | 'suspicious'
}

export interface Proof {
  id: string
  user_id: string
  title: string
  type: ProofType
  content_hash: string
  analysis: ProofAnalysis
  credibility_score: number
  created_at: string
  plan_at_creation: Plan
  file_url?: string
  source_url?: string
  raw_content?: string
}

export interface Subscription {
  user_id: string
  stripe_customer_id: string
  plan: Plan
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_end: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}
