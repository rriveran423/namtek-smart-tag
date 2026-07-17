# Namtek Smart Tag

A mobile-first digital identity platform for NFC/QR smart tags, built with Next.js, TypeScript, Supabase, and Vercel.

## What is included

- Marketing page and live demo at `/p/alex`
- Email/password authentication with cookie-based Supabase SSR
- Authenticated profile dashboard
- Public profile pages at `/p/[username]`
- Downloadable vCard contact files
- Postgres schema and Row Level Security policies
- Responsive styling and Vercel-ready configuration

## Local setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql`.
3. Copy `.env.example` to `.env.local` and add the project URL and publishable key from Supabase Project Settings → API.
4. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
5. Run `npm install`, then `npm run dev`.

In Supabase Authentication → URL Configuration, add `http://localhost:3000/auth/callback` as a redirect URL. Add the production Vercel callback after deployment.

## GitHub and Vercel

1. Create an empty GitHub repository and push this folder.
2. Import the repository into Vercel; it detects Next.js automatically.
3. Add all three values from `.env.example` in Vercel Project Settings → Environment Variables. Use your final `https://...vercel.app` or custom domain for `NEXT_PUBLIC_SITE_URL`.
4. Deploy, then add `https://your-domain/auth/callback` to Supabase's allowed redirect URLs.

Never commit `.env.local` or a Supabase secret/service-role key. The publishable key is intended for the browser; RLS protects the data.

## Connecting a physical tag

Program each NFC tag with the owner's public URL, for example `https://your-domain.com/p/alex`. You can use the same URL in a printed QR code.
