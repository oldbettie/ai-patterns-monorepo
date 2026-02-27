import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface EmailVerificationProps {
  verificationUrl: string
  userEmail: string
}

export default function EmailVerification({
  verificationUrl,
  userEmail,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Tailwind>
        <Body className='bg-gray-100 font-sans'>
          <Container className='mx-auto bg-white mb-16'>
            <Section className='px-12 py-12'>
              <Heading className='text-gray-800 text-2xl font-semibold leading-tight mb-5'>
                Verify your email address
              </Heading>
              <Text className='text-gray-800 text-base leading-relaxed mb-4'>
                Hi there! We need to verify your email address ({userEmail}) to
                complete your account setup.
              </Text>
              <Text className='text-gray-800 text-base leading-relaxed mb-4'>
                Click the button below to verify your email address:
              </Text>
              <Button
                className='bg-blue-600 text-white px-5 py-3 rounded text-base font-semibold no-underline text-center block my-5'
                href={verificationUrl}
              >
                Verify Email Address
              </Button>
              <Text className='text-gray-800 text-base leading-relaxed mb-4'>
                Or copy and paste this link in your browser:
              </Text>
              <Link
                href={verificationUrl}
                className='text-blue-600 text-sm underline break-all'
              >
                {verificationUrl}
              </Link>
              <Text className='text-gray-600 text-sm leading-relaxed mt-6'>
                This verification link will expire in 24 hours for security
                reasons.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
