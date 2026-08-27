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
pnpm build          # never `next build` on its own — see below
pnpm test:e2e
```

**Always build with `pnpm build`.** It chains two steps that `next build`
alone skips: copying `amplify_outputs.json` into the module graph, and writing
the `.png` siblings of the generated Open Graph cards. Skipping the first bakes
stale Cognito ids into the bundle; skipping the second leaves every social card
unreachable. `e2e/config.spec.ts` fails loudly if the first has gone stale.

## End-to-end tests

Playwright drives the built static export — the same artifact Amplify deploys —
across Chromium, WebKit, Firefox and an iPhone viewport.

```bash
pnpm test:e2e                    # everything
pnpm test:e2e --project=chromium # one engine
pnpm test:e2e:ui                 # interactive
```

Auth specs need a Cognito test user:

```bash
E2E_PASSWORD=... pnpm test:e2e auth
```

Without it they degrade to asserting the signed-out surface rather than
failing. Two accounts exist for this: `e2e-user@verdedulce.com` and
`e2e-admin@verdedulce.com` (in the `ADMINS` group). The password is a repo
secret, `E2E_PASSWORD`.

Set `BASE_URL` to run the same specs against a deployed origin:

```bash
BASE_URL=https://verdedulce.com pnpm test:e2e routes
```

Two engine-specific notes, both harness limitations rather than product bugs:

- **Signed-in auth is skipped on WebKit over plain http.** Amplify stores
  tokens in `Secure` cookies, which Safari drops on an insecure origin. It
  works over https — the post-deploy smoke job covers it.
- **Safari does not tab to links** unless "Press Tab to highlight each item" is
  enabled, so the keyboard skip-link test is Chromium/Firefox only. The link's
  presence and target are still asserted everywhere.

Visual snapshots are excluded from CI until Linux baselines are committed;
generate them in the Playwright container, since macOS baselines will never
match a CI runner.
