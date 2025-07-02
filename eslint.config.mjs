import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Existing Next.js + TypeScript presets
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Your custom rule overrides
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable 'any' restriction
    },
  },
];

export default eslintConfig;
