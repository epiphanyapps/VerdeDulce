import { test, expect } from "@playwright/test";

const DISH = "/es/menu/tazon-de-cosecha/";
const STORAGE_KEY = "verdedulce.cart.v1";

/**
 * Seeds the persisted cart before any page script runs.
 *
 * Writing it with page.evaluate after a navigation is racy: CartProvider writes
 * its own state back to storage once it has finished reading, so a seed that
 * lands a moment too late is overwritten with an empty cart and the test sees
 * the empty state. addInitScript runs before the document's scripts, so the
 * value is already in place when the provider mounts.
 */
async function seedCart(page: import("@playwright/test").Page, value: string) {
  await page.addInitScript(
    ([key, raw]) => window.localStorage.setItem(key, raw),
    [STORAGE_KEY, value],
  );
}

test.describe("cart", () => {
  test("adds a dish and shows it in the order", async ({ page }) => {
    await page.goto(DISH);
    await page.getByRole("button", { name: "Agregar al pedido" }).click();

    await page.goto("/es/cart/");
    await expect(page.getByRole("link", { name: "Tazón de Cosecha" })).toBeVisible();
    // Scoped: the line subtotal and the order total both read $8,25 at qty 1.
    await expect(page.locator("main li").getByText("$8,25")).toBeVisible();
  });

  test("quantity steps up and down, and removing empties the cart", async ({ page }) => {
    await page.goto(DISH);
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.goto("/es/cart/");

    await page.getByRole("button", { name: "Agregar uno más" }).click();
    await expect(page.getByLabel("Cantidad")).toHaveText("2");
    // Subtotal must track quantity, not just the unit price.
    await expect(page.locator("main li").getByText("$16,50")).toBeVisible();

    await page.getByRole("button", { name: "Quitar uno" }).click();
    await expect(page.getByLabel("Cantidad")).toHaveText("1");

    await page.getByRole("button", { name: "Quitar", exact: true }).click();
    await expect(page.getByText("Tu pedido está vacío")).toBeVisible();
  });

  test("survives a reload", async ({ page }) => {
    await page.goto(DISH);
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.goto("/es/cart/");
    await page.reload();
    await expect(page.getByRole("link", { name: "Tazón de Cosecha" })).toBeVisible();
  });

  test("the checkout link carries the order into WhatsApp", async ({ page }) => {
    await page.goto(DISH);
    await page.getByRole("button", { name: "Agregar al pedido" }).click();
    await page.goto("/es/cart/");

    const href = await page
      .getByRole("link", { name: "Enviar pedido por WhatsApp" })
      .getAttribute("href");

    expect(href).toContain("wa.me/593963021783");
    // The catalog URL (wa.me/c/...) is dead; nothing may link to it.
    expect(href).not.toContain("wa.me/c/");
    const text = new URL(href!).searchParams.get("text") ?? "";
    expect(text).toContain("Tazón de Cosecha");
    expect(text).toContain("$8,25");
  });

  test("recovers from corrupt stored data instead of crashing", async ({ page }) => {
    await seedCart(page, "{not json at all");
    await page.goto("/es/cart/");
    await expect(page.getByText("Tu pedido está vacío")).toBeVisible();
  });

  test("drops a slug that is no longer on the menu", async ({ page }) => {
    await seedCart(
      page,
      JSON.stringify([
        { slug: "dish-deleted-last-year", quantity: 2 },
        { slug: "tazon-de-cosecha", quantity: 1 },
      ]),
    );
    await page.goto("/es/cart/");

    // The stale entry must be pruned, and the valid one kept.
    await expect(page.getByRole("link", { name: "Tazón de Cosecha" })).toBeVisible();
    // Scoped to the page body: the header cart link carries the same count
    // as screen-reader-only text.
    await expect(page.locator("main p").getByText("1 artículo")).toBeVisible();
  });

  test("persists only slug and quantity, never price", async ({ page }) => {
    await page.goto(DISH);
    await page.getByRole("button", { name: "Agregar al pedido" }).click();

    const stored = await page.evaluate(
      ([key]) => window.localStorage.getItem(key),
      [STORAGE_KEY],
    );
    const parsed = JSON.parse(stored!);
    // Price and copy are resolved from content at read time so a stale cart in
    // someone's browser can never quote an old price.
    expect(Object.keys(parsed[0]).sort()).toEqual(["quantity", "slug"]);
  });
});
