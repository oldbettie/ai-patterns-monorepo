import { env } from '@/lib/env'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import 'server-only'
import EmailVerification from './templates/email-verification'
import PasswordReset from './templates/password-reset'

export class EmailService {
  private readonly fromEmail = `noreply@${env.FROM_EMAIL}` // TODO: this might now work

  constructor(private readonly emailProvider: Resend) {}

  async sendVerificationEmail({
    email,
    verificationUrl,
  }: {
    email: string
    verificationUrl: string
  }) {
    try {
      const emailHtml = await render(
        EmailVerification({
          userEmail: email,
          verificationUrl,
        })
      )

      const result = await this.emailProvider.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify your email address',
        html: emailHtml,
      })

      return result
    } catch (error) {
      console.error('Error sending verification email:', error)
      throw error
    }
  }

  async sendPasswordResetEmail({
    email,
    resetUrl,
  }: {
    email: string
    resetUrl: string
  }) {
    const emailHtml = await render(
      PasswordReset({
        userEmail: email,
        resetUrl,
      })
    )

    return await this.emailProvider.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Reset your password',
      html: emailHtml,
    })
  }
}
