export const TECH_STACK = ['Next.js 16', 'Better Auth', 'Drizzle ORM', 'Tailwind CSS v4', 'TypeScript', 'pnpm']

export const DEPLOYMENT_PROVIDERS = [
  { key: 'railway', href: 'https://railway.com?referralCode=4uNPq2', recommended: true },
  { key: 'neon', href: 'https://neon.tech', recommended: true },
  { key: 'resend', href: 'https://resend.com', recommended: false },
  { key: 'vercel', href: 'https://vercel.com', recommended: false },
  { key: 'supabase', href: 'https://supabase.com', recommended: false },
] as const

export const ADVANCED_ITEMS = ['i18n', 'analytics', 'oauth'] as const
