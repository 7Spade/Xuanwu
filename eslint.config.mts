import nextVitals from "eslint-config-next/core-web-vitals";
import checkFile from "eslint-plugin-check-file";
import tailwind from "eslint-plugin-tailwindcss";
import tseslint from "typescript-eslint";

const SOURCE_FILES = ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"];

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "src/shared-infra/backend-firebase/**",
      "src/shared-infra/frontend-firebase/**",
      "src/shared/shadcn-ui/**",
      "dist/**"
    ],
  },

  ...nextVitals,

  {
    files: SOURCE_FILES,
    plugins: {
      "check-file": checkFile,
      tailwindcss: tailwind,
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off",

      "import/order": ["warn", { 
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],

      "no-unused-vars": "off",
      "check-file/folder-naming-convention": [
        "warn",
        {
          "src/features/**": "+([-a-z0-9_.])",
          "src/shared/**": "+([-a-z0-9_.])",
          "src/shared-infra/**": "+([-a-z0-9_.])",
          "src/config/**": "+([-a-z0-9_.])",
          "src/app-runtime/**": "+([-a-z0-9_.])"
        }
      ]
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Allow the repository's underscore-based ignore convention for intentionally unused values.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
      ],

      "check-file/filename-naming-convention": [
        "warn",
        { "**/*.{tsx,ts}": "+([-a-z0-9_])" },
        { "ignoreMiddleExtensions": true }
      ]
    },
  },

  // [D24] FIREBASE_ACL 邊界：features 切片禁止直接引用 firebase/* SDK
  // Scoped only to src/features/** — the shared/infra adapters are the ACL boundary themselves.
  {
    files: ["src/features/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}", "src/app-runtime/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          "paths": [
            {
              "name": "firebase/firestore",
              "message": "[D24] Import Firestore utilities from '@/shared/infra/firestore/firestore.read.adapter' or '@/shared/infra/firestore/firestore.write.adapter' instead of 'firebase/firestore'."
            },
            {
              "name": "firebase/auth",
              "message": "[D24] Import Auth utilities from '@/shared/infra/auth/auth.client' or auth adapter instead of 'firebase/auth'."
            },
            {
              "name": "firebase/storage",
              "message": "[D24] Import Storage utilities from '@/shared/infra/storage/storage.facade' instead of 'firebase/storage'."
            }
          ]
        }
      ]
    }
  }
);
