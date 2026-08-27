# Verde Dulce — web

The Verde Dulce site: Next.js 15 (App Router), Tailwind v4, next-intl.
Replaces the Expo Router / react-native-web app at the repo root.

## Running it

```bash
cd web
pnpm install
pnpm dev          # http://localhost:3000 -> redirects to /es/
```

`pnpm build` writes a static export to `web/out/`.

## How it's put together

```
src/
  app/[locale]/         routes; every page is prerendered per locale
  components/           UI, server components unless they need state
  content/menu.json     the menu, bilingual (es/en)
  content/faq.json      FAQ entries, bilingual
  i18n/routing.ts       locales, default, and the navigation helpers
  lib/image.ts          CloudFront image-handler URL builder
  messages/{es,en}.json UI strings
```

### Static export

`output: "export"` in `next.config.ts`. The site has no per-request data — the
menu ships with the build — so there is no server runtime, which also means the
Amplify Next.js version ceiling (15, for its compute platform) does not apply.

Two consequences:

- **No middleware.** Locale negotiation for `/` is an Amplify redirect rule
  (`/` -> `/es/`, 302). `src/app/page.tsx` is the client-side fallback.
- **No image optimizer.** `src/lib/imageLoader.ts` points `next/image` at the
  existing CloudFront Serverless Image Handler instead, which keeps `srcSet`,
  `sizes`, and lazy-loading working.

To move onto Amplify's compute platform later, delete `output: "export"` and
switch the app's platform to `WEB_COMPUTE`.

### Amplify backend

Auth (Cognito), Storage (S3), and Analytics (Pinpoint) stay in the Gen 2 backend
at the repo root. `scripts/sync-amplify-outputs.mjs` copies the generated
`amplify_outputs.json` into `src/generated/` so it resolves inside the Next
module graph; it runs automatically on `dev` and `build`.

All auth is client-side, so the auth-gated pages are still statically exported —
they render their signed-out state in the HTML.

### Adding or changing a menu item

Edit `src/content/menu.json` and redeploy. Images upload to the
`menu-pictures/` S3 prefix via `/admin` (requires the `ADMINS` or `EDITORS`
Cognito group), but copy, price, and nutrition ship with the build.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```
