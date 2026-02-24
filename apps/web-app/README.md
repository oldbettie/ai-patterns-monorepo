# Postgres + Drizzle Next.js Starter

Simple Next.js template that uses a Postgres database and Drizzle as the ORM.

Full stack includes:
- Next.js
- BetterAuth
- Postgres/Drizzle
- TailwindCSS
- Docker for local database systems

## Overview
Remember Claude code can help you with any step you get stuck with.


## Better-Auth
Better auth is nice because its our own database and server interactions are direct to the database for the session and not with any auth api. It's
also very easy to extend via the plugins available.

`auth.api.getSession` is a direct to database connection to validate the session.
`useSession` allows us to use that session in the frontend.

### Email Verification Setup

This template includes a complete email verification and password reset system using Better Auth + Resend + React Email.

#### Required Configuration

1. **Resend API Key**: Sign up at [resend.com](https://resend.com) and get your API key
2. **Domain Verification**: Add and verify your domain in Resend dashboard (you will need to work with your domain provider)
3. **Environment Variables**: Generate your `.env.local` file based on .env.example:

#### Email Features Included

- ✅ **Email Verification Required**: Users must verify email before accessing the app
- ✅ **Automatic Email Sending**: Verification emails sent on signup and login attempts
- ✅ **Resend Functionality**: Users can resend verification emails (5-minute cooldown)
- ✅ **Password Reset Flow**: Complete forgot password → email → reset → success flow
- ✅ **React Email Templates**: Beautiful, responsive email templates with Tailwind CSS
- ✅ **Auto-login After Verification**: Users automatically logged in after email verification

#### Email Flow Pages

- `/auth/verify-email` - Email verification pending page with resend functionality
- `/auth/verify-email/success` - Email verification success page
- `/auth/forgot-password` - Password reset request page
- `/auth/reset-password` - Password reset form page

#### Customizing Email Templates

Email templates are located in `lib/resend/templates/`:
- `email-verification.tsx` - Email verification template
- `password-reset.tsx` - Password reset template

Your email provides has to match resends configuration

#### Architecture

- **EmailService Class**: Handles all email operations with dependency injection
- **React Email**: Professional email templates with Tailwind CSS
- **Better Auth Integration**: Seamless integration with authentication flows
- **Server Components**: Email pages use Next.js 15 server components with client interactivity
