# personal-web (Next.js)

This scaffolds a minimal Next.js app using the React code you provided in `web.txt`.

Quick setup (Windows PowerShell):

```
cd "c:\Users\USER\Desktop\personal-web"
npm install
npm run dev
```

Notes:

If you'd like, I can run `npm install` for you here (I won't run commands without your approval), or switch this to the new Next.js `app/` router structure.
# personal-web

hey — welcome to my messy little Next.js corner. this repo holds a quirky, client-heavy portfolio built from a single-file React sketch (shoutout to `web.txt`). it's equal parts website and sandbox.

Quick start (Windows PowerShell):

```powershell
cd "c:\Users\USER\Desktop\personal-web"
npm install
npm run dev
```

Open http://localhost:3000 after `npm run dev`.

What this is
- A Next.js pages-router site that deliberately keeps the interactive app client-only to avoid server-side hydration tantrums.
- The full interactive UI is in `components/AppClient.jsx` and is dynamically imported from `pages/index.jsx` with `ssr: false`.
- Photos live in `public/images/photography/` and are displayed with a lightbox.
- Favicon at `public/images/icon.ico`.

Why it looks weird
- The original app uses canvas, direct DOM access, and other browser-only APIs — so we load it only on the client. This keeps Next.js from trying to pre-render things it can't.

Files you care about
- `components/AppClient.jsx`: the entire UI and interactive bits.
- `pages/index.jsx`: small loader that dynamically imports the client app.
- `pages/_app.jsx`: global CSS + head (favicon link).
- `public/images/*`: where portraits and gallery images live.

Run a production build
```powershell
npm run build
npm start
```

Deploy
- There's a `vercel.json` already; connecting this repo to Vercel should work.

To-do / Nice-to-have
- Improve accessibility: alt text, keyboard navigation for the lightbox, and focus management.
- Lazy-load big photos and add blur-up placeholders.
- Split `AppClient.jsx` into smaller components for readability.

If you want me to:
- tweak styles, add keyboard nav to the gallery, or generate optimized image variants, say the word and I'll patch it right in.

— ash (quirky dev helper)
