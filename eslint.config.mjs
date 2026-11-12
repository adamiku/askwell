import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";

export default [
  { ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/next-env.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals.map((c) => ({ ...c, files: ["apps/web/**/*.{ts,tsx,js,mjs}"] })),
  { rules: { "@typescript-eslint/no-explicit-any": "error" } },
];
