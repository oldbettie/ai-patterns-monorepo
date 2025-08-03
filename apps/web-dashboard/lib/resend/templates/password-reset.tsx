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

interface PasswordResetProps {
  resetUrl: string
  userEmail: string
}

export default function PasswordReset({
  resetUrl,
  userEmail,
}: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className='bg-gray-100 font-sans'>
          <Container className='mx-auto bg-white mb-16'>
            <Section className='px-12 py-12'>
              <Heading className='text-gray-800 text-2xl font-semibold leading-tight mb-5'>
                Reset your password
              </Heading>
              <Text className='text-gray-800 text-base leading-relaxed mb-4'>
                Hi! We received a request to reset the password for your account
                ({userEmail}).
              </Text>
              <Text className='text-gray-800 text-base leading-relaxed mb-4'>
                Click the button below to reset your password:
              </Text>
              <Button
                className='bg-blue-600 text-white px-5 py-3 rounded text-base font-semibold no-underline text-center block my-5'
                href={resetUrl}
              >
                Reset Password
              </Button>
              <Text className='text-gray-800 text-base leading-relaxed mb-4'>
                Or copy and paste this link in your browser:
              </Text>
              <Link
                href={resetUrl}
                className='text-blue-600 text-sm underline break-all'
              >
                {resetUrl}
              </Link>
              <Text className='text-gray-600 text-sm leading-relaxed mt-6'>
                This reset link will expire in 1 hour for security reasons.
              </Text>
              <Text className='text-gray-600 text-sm leading-relaxed mt-4'>
                If you didn&apos;t request this password reset, you can safely
                ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
