import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'SimplifiedPDF'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF543E 0%, #FF1C6B 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: 48,
            width: 320,
            height: 320,
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          }}
        >
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              color: '#FF543E',
              lineHeight: 1,
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#1A1A1A',
              marginTop: 8,
            }}
          >
            SimplifiedPDF
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
