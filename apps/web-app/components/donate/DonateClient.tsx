'use client'
// @feature:donations @domain:donations @frontend
// @summary: Client-side donation form with Stripe Elements integration

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useOnlineStatus } from '@/components/hooks/useOnlineStatus'
import { createDonationIntentAction } from '@/actions/donation-actions'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

const PRESET_AMOUNTS = [500, 1000, 2000] // cents

interface CheckoutFormProps {
  clientSecret: string
}

function CheckoutForm({ clientSecret }: CheckoutFormProps) {
  const t = useTranslations('pages.donate')
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setErrorMsg(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donate/success`,
      },
    })

    if (error) {
      setErrorMsg(error.message ?? 'Payment failed')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {processing ? t('processing') : t('donate')}
      </button>
    </form>
  )
}

interface DonateClientProps {
  isDonor: boolean
}

export function DonateClient({ isDonor }: DonateClientProps) {
  const t = useTranslations('pages.donate')
  const isOnline = useOnlineStatus()
  const [selectedAmount, setSelectedAmount] = useState(PRESET_AMOUNTS[1])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleProceed = async () => {
    setLoading(true)
    const result = await createDonationIntentAction(selectedAmount)
    if (result.data?.clientSecret) {
      setClientSecret(result.data.clientSecret)
    }
    setLoading(false)
  }

  if (!isOnline) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 text-sm">{t('offlineMessage')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-2">
        {t('title')}
      </h1>
      <p className="text-neutral-500 text-sm text-center mb-8">{t('subtitle')}</p>

      {isDonor ? (
        <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 text-center">
          <p className="text-green-700 dark:text-green-400 text-sm">{t('alreadyDonor')}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
          {!clientSecret ? (
            <>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('amount')}</p>
              <div className="flex gap-3">
                {PRESET_AMOUNTS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                      selectedAmount === amount
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    ${(amount / 100).toFixed(0)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleProceed}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? t('processing') : t('donate')}
              </button>
            </>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          )}
        </div>
      )}
    </div>
  )
}
