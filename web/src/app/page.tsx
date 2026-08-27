import { routing } from "@/i18n/routing";

const DEFAULT = `/${routing.defaultLocale}/`;

/**
 * Locale negotiation on a static export.
 *
 * The Amplify redirect rule handles `/` for real traffic; this page is the
 * fallback for anything that reaches the HTML directly (local `next start`,
 * a preview host, a crawler following an old link). The inline script upgrades
 * the redirect to the visitor's own language before the meta refresh fires.
 */
const NEGOTIATE = `
(function () {
  var supported = ${JSON.stringify(routing.locales)};
  var target = ${JSON.stringify(routing.defaultLocale)};
  var preferred = (navigator.languages || [navigator.language || ""]);
  for (var i = 0; i < preferred.length; i++) {
    var tag = String(preferred[i]).toLowerCase().split("-")[0];
    if (supported.indexOf(tag) !== -1) { target = tag; break; }
  }
  location.replace("/" + target + "/");
})();
`;

export default function RootRedirect() {
  return (
    <html lang={routing.defaultLocale}>
      <head>
        <meta httpEquiv="refresh" content={`0; url=${DEFAULT}`} />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={DEFAULT} />
        <script dangerouslySetInnerHTML={{ __html: NEGOTIATE }} />
      </head>
      <body>
        <a href={DEFAULT}>Verde Dulce</a>
      </body>
    </html>
  );
}
