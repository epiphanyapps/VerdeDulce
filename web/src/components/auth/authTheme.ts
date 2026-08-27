import type { Theme } from "@aws-amplify/ui-react";

/**
 * Brand theme for the Amplify Authenticator.
 *
 * Without this the hosted UI renders in Amplify's stock teal with square
 * corners and system type, which reads as a third-party widget dropped into
 * the page. Values mirror the tokens in globals.css — keep the two in step.
 */
const forest = "#0b3e35";
const cream = "#f2f1e4";
const lime = "#ebfe72";
const kale = "#0e150e";
const line = "#d5d3c0";

export const authTheme: Theme = {
  name: "verde-dulce",
  tokens: {
    fonts: {
      default: {
        variable: { value: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif" },
        static: { value: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif" },
      },
    },
    colors: {
      // The Authenticator derives most of its chrome from brand.primary.
      brand: {
        primary: {
          10: { value: "#eef2ef" },
          20: { value: "#d8e5d6" },
          40: { value: "#7fa093" },
          60: { value: "#3d6a5d" },
          80: { value: forest },
          90: { value: "#092f28" },
          100: { value: kale },
        },
      },
      background: {
        primary: { value: "#ffffff" },
        secondary: { value: cream },
      },
      font: {
        primary: { value: kale },
        secondary: { value: "#4a5a4a" },
        interactive: { value: forest },
      },
      border: {
        primary: { value: line },
        focus: { value: forest },
      },
    },
    radii: {
      small: { value: "0.5rem" },
      medium: { value: "0.75rem" },
      large: { value: "0.75rem" },
    },
    components: {
      authenticator: {
        router: {
          borderWidth: { value: "1px" },
          borderColor: { value: line },
          backgroundColor: { value: "#ffffff" },
          boxShadow: { value: "0 1px 2px rgba(14, 21, 14, 0.04)" },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: forest },
          color: { value: lime },
          _hover: { backgroundColor: { value: "#135045" }, color: { value: lime } },
          _focus: { backgroundColor: { value: "#135045" }, color: { value: lime } },
          _active: { backgroundColor: { value: "#092f28" }, color: { value: lime } },
        },
        link: {
          color: { value: forest },
          _hover: { backgroundColor: { value: "transparent" }, color: { value: kale } },
        },
      },
      fieldcontrol: {
        borderColor: { value: line },
        borderRadius: { value: "0.5rem" },
        _focus: {
          borderColor: { value: forest },
          boxShadow: { value: `0 0 0 1px ${forest}` },
        },
      },
      tabs: {
        item: {
          color: { value: "#4a5a4a" },
          borderColor: { value: line },
          _active: { color: { value: forest }, borderColor: { value: forest } },
          _hover: { color: { value: forest } },
        },
      },
      heading: { color: { value: kale } },
    },
  },
};
