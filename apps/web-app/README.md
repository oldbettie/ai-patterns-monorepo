# Postgres + Drizzle Next.js Starter

Simple Next.js template that uses a Postgres database and Drizzle as the ORM.

This will be my baseline template for the following stack
- Next.js
- BetterAuth
- Postgres/Drizzle
- Tailwind

### Setup
Copy the env.example file to .env.docker or env.local if you are not using the docker instance for some reason.

I have build this to get started quickly all you need to do is run the stack locally.
```bash
pnpm install
```
```bash
docker compose up
```

Once the stack is up you can run the migrations that already exist with the following.
```bash
pnpm db:migrate
```

Local webapp and API
https://localhost:3000

DB dashboard with pgweb
https://localhost:5050

## Claude Code Init
When copying this project you will need to initialise claude code with the config. The current config uses gemini MCP for larger context control to reduce claude costs.

to add the gemini MCP to the claude instance once you have started claude code you can run.
`claude mcp add gemini-cli -- npx -y gemini-mcp-tool`
or checkout
https://github.com/jamubc/gemini-mcp-tool

## Better-Auth
Better auth is nice because its our own database and server interactions are direct to the database for the session and not with any auth api

`auth.api.getSession` is a direct to database connection to validate the session.
`useSession` allows us to use that session in the frontend.

### Email Verification Setup

This template includes a complete email verification and password reset system using Better Auth + Resend + React Email.

#### Required Configuration

1. **Resend API Key**: Sign up at [resend.com](https://resend.com) and get your API key
2. **Domain Verification**: Add and verify your domain in Resend dashboard
3. **Environment Variables**: Update your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_DOMAIN=yourdomain.com  # Your verified domain (without @)
```

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

Update the `fromEmail` in `lib/resend/email-service.ts` to match your verified domain.

#### Architecture

- **EmailService Class**: Handles all email operations with dependency injection
- **React Email**: Professional email templates with Tailwind CSS
- **Better Auth Integration**: Seamless integration with authentication flows
- **Server Components**: Email pages use Next.js 15 server components with client interactivity

## TODO
- Setup i18n
- Setup 3rd party providers
- add CICD pipelines
- figure out best deployment pipelines
- Check for anything I have missed and add documentation

## Git Cloning
As this is a private repo you need to clone and then remote the remote link to this template repository

  git remote set-url origin https://github.com/yourusername/your-new-project.git

  This way you can:
  1. Keep pushing updates to the template repo as its own project
  2. When cloning for a new project, just change the remote URL to the new project's repo
