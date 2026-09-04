import { test, expect } from "@playwright/test";
import outputs from "../src/generated/amplify_outputs.json";

/**
 * Credentials come from the environment. Without them the suite still asserts
 * the signed-out surface, so the harness is green on a fork or a machine with
 * no secrets rather than failing for the wrong reason.
 */
const PASSWORD = process.env.E2E_PASSWORD;
const USER = process.env.E2E_USER ?? "e2e-user@verdedulce.com";
const ADMIN = process.env.E2E_ADMIN ?? "e2e-admin@verdedulce.com";

/**
 * Whether the loyalty API exists in the environment under test.
 *
 * The loyalty page opens a card through `ensureLoyaltyCard` on first render, so
 * its test cannot pass until the data resource has been deployed and
 * `amplify_outputs.json` refreshed — and the backend only deploys on merge to
 * main, which this suite gates. Rather than assert something environmental and
 * go red for the wrong reason, the test declares the dependency and skips until
 * it is met. It turns itself on with no edit once the outputs carry `data`.
 */
const LOYALTY_API = "data" in outputs;

/**
 * Signs in and waits for the session to be established.
 *
 * The wait is the important part: LoginPanel redirects to /account/ once
 * Cognito returns, and navigating away before that lands aborts the in-flight
 * request, leaving the next page rendering the signed-out Authenticator.
 */
async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.goto("/es/login/");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD!);
  // `exact` matters now that "Iniciar sesión con Google" is on the same panel —
  // the default substring match would hit both buttons.
  await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/account\/$/, { timeout: 30_000 });
}

test.describe("authenticator, signed out", () => {
  test("renders in Spanish on the Spanish route", async ({ page }) => {
    await page.goto("/es/login/");
    // Regression guard for the stock English widget that shipped initially.
    await expect(page.getByRole("tab", { name: "Iniciar sesión" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Crear cuenta" })).toBeVisible();
    await expect(page.getByText("Correo electrónico")).toBeVisible();
    await expect(page.getByText("¿Olvidaste tu contraseña?")).toBeVisible();
    await expect(page.getByText("Sign In", { exact: true })).toHaveCount(0);
  });

  test("renders in English on the English route", async ({ page }) => {
    await page.goto("/en/login/");
    await expect(page.getByRole("tab", { name: "Sign In" })).toBeVisible();
  });

  test("offers Google as a sign-in option in both locales", async ({ page }) => {
    await page.goto("/es/login/");
    await expect(
      page.getByRole("button", { name: "Iniciar sesión con Google" }),
    ).toBeVisible();
    await page.goto("/en/login/");
    await expect(
      page.getByRole("button", { name: "Sign In with Google" }),
    ).toBeVisible();
  });

  test("account and admin are gated", async ({ page }) => {
    await page.goto("/es/account/");
    await expect(page.getByRole("tab", { name: "Iniciar sesión" })).toBeVisible();
    await page.goto("/es/admin/");
    await expect(page.getByRole("tab", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("loyalty sells the programme above the sign-in form", async ({ page }) => {
    await page.goto("/es/loyalty/");
    // The gate used to show a bare Cognito widget. The welcome stamp is the
    // reason to register, so it has to be legible before signing up.
    await expect(page.getByText("Cómo funciona")).toBeVisible();
    await expect(page.getByText(/primer sello ya está en la tarjeta/)).toBeVisible();
    await expect(page.getByRole("tab", { name: "Crear cuenta" })).toBeVisible();
  });

  test("auth pages are excluded from search", async ({ page }) => {
    await page.goto("/es/account/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});

test.describe("authenticator, signed in", () => {
  test.skip(!PASSWORD, "E2E_PASSWORD not set");

  /**
   * Amplify is configured with `ssr: true`, so tokens live in cookies marked
   * Secure. WebKit refuses to persist those over plain http, and sign-in fails
   * with "Unable to get user session following successful sign-in" — against
   * the local file server only. Verified working in WebKit over https on the
   * deployed site, so this is a limitation of the harness, not the product.
   * Point BASE_URL at an https origin to cover these engines.
   */
  test.skip(({ browserName, baseURL }) => {
    const insecure = (baseURL ?? "").startsWith("http://");
    return browserName === "webkit" && insecure;
  }, "WebKit will not persist Secure auth cookies over http");
  // Cognito round-trips are slower than anything else in the suite.
  test.setTimeout(60_000);

  test("a standard user can sign in and out", async ({ page }) => {
    await signIn(page, USER);
    await expect(page.getByText(USER)).toBeVisible();

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("tab", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("a standard user is refused the admin surface", async ({ page }) => {
    await signIn(page, USER);
    await page.goto("/es/admin/");
    // Group membership is a UI affordance only — the bucket policy is the real
    // control — but the affordance must still be correct.
    await expect(
      page.getByText("Necesitas permisos de administrador"),
    ).toBeVisible();
  });

  test("an ADMINS user reaches the upload form", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/es/admin/");
    await expect(page.getByLabel("menu-pictures/")).toBeVisible();
  });

  test("the loyalty card shows once signed in", async ({ page }) => {
    test.skip(!LOYALTY_API, "loyalty data resource is not deployed in this environment");
    await signIn(page, USER);
    await page.goto("/es/loyalty/");

    // The card is opened by `ensureLoyaltyCard` on first render, so this also
    // covers the mutation round-trip, not just the markup.
    await expect(page.getByRole("list", { name: "Tarjeta de sellos" })).toBeVisible({
      timeout: 30_000,
    });

    // The member code is the whole point of the page at the counter: six
    // characters from the unambiguous alphabet the handler mints from.
    await expect(page.getByText(/^[ACDEFGHJKMNPQRTUVWXY3469]{6}$/)).toBeVisible();

    // Every card carries the welcome stamp, so the history is never empty and
    // the progress line is never a bare zero.
    await expect(page.getByText("Sello de bienvenida")).toBeVisible();
  });
});
