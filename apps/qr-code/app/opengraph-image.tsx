import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Quick QR'
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
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
              fontSize: 80,
              fontWeight: 900,
              color: '#6366f1',
              lineHeight: 1,
            }}
          >
            QR
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#1A1A1A',
              marginTop: 8,
            }}
          >
            Quick QR
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
