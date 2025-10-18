import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      
      // React rules
      "react/no-unescaped-entities": "off",
      "react/jsx-key": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General rules
      "prefer-const": "error",
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      "no-debugger": "error",
      
      // Import rules
      "import/order": ["error", {
        "groups": [
          "builtin",
          "external", 
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }],
    },
  },
  {
    files: ["**/*.config.{js,ts}", "**/middleware.ts"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;