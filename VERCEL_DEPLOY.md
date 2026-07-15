# Deploy to Vercel

This project is ready to deploy as a static Vercel app.

## Fast deploy from Vercel website

1. Go to https://vercel.com/new
2. Import this project folder from GitHub, or upload/push this folder to a GitHub repository first.
3. Framework Preset: Other
4. Build Command: leave empty
5. Output Directory: leave empty
6. Click Deploy

## Deploy from terminal

Install and login first:

```powershell
npm i -g vercel
vercel login
```

Then from this folder run:

```powershell
vercel
vercel --prod
```

## Important saving note

On Vercel, server file saving is not permanent. Use Choose Bills Folder in supported browsers, or the app will download bill/report HTML files. For permanent online storage, connect a database or cloud storage later.
