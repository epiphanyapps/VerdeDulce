import { defineAuth, secret } from "@aws-amplify/backend";
import { preSignUp } from "./pre-sign-up/resource";

/**
 * Origins the site is served from. Cognito matches OAuth redirects exactly, so
 * every origin the Authenticator can run on has to be listed — including the
 * apex, which 302s to www for page loads but is still a valid dev/test entry.
 */
const ORIGINS = [
  "http://localhost:3000",
  "https://verdedulce.com",
  "https://www.verdedulce.com",
];

/** Every page that mounts the Authenticator, in every locale (see web/src/i18n/routing.ts). */
const LOCALES = ["es", "en"];
const AUTH_PAGES = ["login", "account", "loyalty", "admin"];

/**
 * Amplify picks the callback URL whose origin *and* path match the page the
 * user started from, so listing each gated page returns them where they were
 * instead of dumping everyone on /es/login/. Trailing slashes are required —
 * the static export serves directory-style URLs (`trailingSlash: true`).
 */
const callbackUrls = ORIGINS.flatMap((origin) =>
  LOCALES.flatMap((locale) =>
    AUTH_PAGES.map((page) => `${origin}/${locale}/${page}/`)
  )
);

const logoutUrls = ORIGINS.flatMap((origin) =>
  LOCALES.map((locale) => `${origin}/${locale}/`)
);

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        // Set with `npx ampx sandbox secret set` locally, and in the Amplify
        // console (App settings -> Secrets) for the deployed branches.
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        scopes: ["email", "profile", "openid"],
        // email is a required attribute on this pool; without the mapping
        // Cognito rejects the federated sign-up.
        //
        // email_verified is mapped because the pre-sign-up trigger refuses to
        // link a federated identity into an existing account unless the
        // provider asserts the address was verified. Without this the claim
        // never reaches the trigger and no linking can happen at all.
        //
        // It goes through `custom` rather than a named key: this repo is on
        // aws-cdk-lib 2.158, whose AttributeMapping predates `emailVerified`.
        // Amplify documents `custom` as the route for standard attributes its
        // typed keys do not cover yet. Move it to `emailVerified` if CDK is
        // ever bumped past 2.181.
        attributeMapping: {
          email: "email",
          custom: { email_verified: "email_verified" },
        },
      },
      // Note: the Cognito hosted-UI domain prefix is NOT settable here —
      // @aws-amplify/backend-auth overwrites it with a stable hash of the
      // backend id. Read the resulting domain out of amplify_outputs.json
      // (auth.oauth.domain) after the first deploy.
      callbackUrls,
      logoutUrls,
    },
  },
  triggers: {
    // Attaches a Google sign-in to an existing email account instead of
    // creating a second user. See pre-sign-up/handler.ts.
    preSignUp,
  },
  groups: ["ADMINS", "EDITORS"],
});
