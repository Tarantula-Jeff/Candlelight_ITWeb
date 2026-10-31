# Candlelight Studio

Next.js site for Candlelight Studio's coding games, music collection, AI art gallery, and protected admin workspace.

## Local development

```powershell
npm.cmd run dev
```

Open `http://localhost:3000`.

## Vercel deployment

Import this GitHub repository in Vercel. The framework preset is **Next.js** and the build command is detected automatically.

Add these environment variables in Vercel before deploying:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_SESSION_TOKEN
```

Use the same values as your local `.env.local` file. Never commit `.env.local` or a service-role key.

## Important current limitation

The initial music and artwork files are part of the repository and will display on Vercel. The current admin uploader writes files and library data locally, which is suitable for local development only; Vercel's serverless file system does not retain new uploads. Connect Supabase Storage and database before relying on hosted uploads.
