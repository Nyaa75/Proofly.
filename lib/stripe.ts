import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

  typescript: true,
})

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    proofs: 50,
    features: ['50 certifications/mois', 'Analyse IA avancée', 'Badge vérifié', 'Export PDF'],
  },
  agency: {
    name: 'Agency',
    price: 29,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    proofs: -1, // unlimited
    features: [
      'Certifications illimitées',
      'API access',
      'Multi-clients',
      'Rapport mensuel',
      'Support prioritaire',
    ],
  },
}
