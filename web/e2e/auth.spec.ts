import { test, expect } from "@playwright/test";

/**
 * Credentials come from the environment. Without them the suite still asserts
 * the signed-out surface, so the harness is green on a fork or a machine with
 * no secrets rather than failing for the wrong reason.
 */
const PASSWORD = process.env.E2E_PASSWORD;
const USER = process.env.E2E_USER ?? "e2e-user@verdedulce.com";
const ADMIN = process.env.E2E_ADMIN ?? "e2e-admin@verdedulce.com";

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
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
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

  test("account and admin are gated", async ({ page }) => {
    await page.goto("/es/account/");
    await expect(page.getByRole("tab", { name: "Iniciar sesión" })).toBeVisible();
    await page.goto("/es/admin/");
    await expect(page.getByRole("tab", { name: "Iniciar sesión" })).toBeVisible();
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
    await signIn(page, USER);
    await page.goto("/es/loyalty/");
    await expect(page.getByRole("list", { name: /lealtad/i })).toBeVisible();
  });
});
