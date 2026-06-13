import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import svgJsxPlugin from "eslint-plugin-svg-jsx";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "svg-jsx": svgJsxPlugin,
    },
    rules: {
      "svg-jsx/camel-case-dash": "warn",
      "svg-jsx/camel-case-colon": "warn",
      "svg-jsx/no-style-string": "warn",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/prefer-as-const": "warn",
      "react/no-children-prop": "off",
      "require-await": "warn",
      "react/display-name": "off",
      "@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "none" }],
    },
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]);

export default eslintConfig;
