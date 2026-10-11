import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Product images are arbitrary external URLs stored in the database; a plain
      // <img> keeps the catalogue resilient to any origin (see PROJECT_PLAN D2).
      "@next/next/no-img-element": "off",
      // Hydrating the cart from localStorage, seeding an edit form from fetched
      // data, and toggling a loading flag are intentional external-sync patterns.
      // The React Compiler's strict interpretation is not a good fit here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
