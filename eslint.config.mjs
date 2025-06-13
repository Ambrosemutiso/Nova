import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Include default Next.js ESLint rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Add this block to ignore generated Prisma files
  {
    files: ["src/generated/prisma/**"],
    rules: {
      // Turn off all common rules that Prisma violates
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off"
    }
  }
];

export default eslintConfig;
