import { routing } from "@/i18n/routing";

/**
 * Rendered for paths outside any locale segment. It deliberately avoids
 * next-intl: there is no locale in scope to resolve messages against.
 */
export default function NotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f2f1e4",
          color: "#0e150e",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 300 }}>404</h1>
          <p style={{ color: "#4a5a4a" }}>
            Página no encontrada · Page not found
          </p>
          <p style={{ marginTop: "1.5rem" }}>
            <a href={`/${routing.defaultLocale}/`} style={{ color: "#0b3e35" }}>
              Verde Dulce
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
