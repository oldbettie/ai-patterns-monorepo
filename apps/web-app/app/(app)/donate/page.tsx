// @feature:donations @domain:donations @frontend
// @summary: Donation page — auth-guarded server component rendering the donate form

import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getDonorStatusAction } from '@/actions/donation-actions'
import { DonateClient } from '@/components/donate/DonateClient'

export async function generateMetadata() {
  const t = await getTranslations('pages.donate')
  return { title: t('title') }
}

export default async function DonatePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const statusResponse = await getDonorStatusAction()
  const isDonor = statusResponse.data?.isDonor ?? false

  return <DonateClient isDonor={isDonor} />
}
