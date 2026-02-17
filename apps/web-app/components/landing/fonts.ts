import { Instrument_Serif, Plus_Jakarta_Sans } from 'next/font/google'

export const displayFont = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

export const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})
