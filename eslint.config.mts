import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";
import tailwind from "eslint-plugin-tailwindcss";
import importX from "eslint-plugin-import-x";
import unusedImports from "eslint-plugin-unused-imports";
import checkFile from "eslint-plugin-check-file";
import jsxA11y from "eslint-plugin-jsx-a11y";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 關鍵修正：將 'basePath' 改為 'baseDirectory'
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default tseslint.config(
  {
    // 忽略特定目錄
    ignores: [
      ".next/**",
      "node_modules/**",
      "src/shared-infra/firebase/**",
      "dist/**"
    ],
  },
  
  // 1. JS & TS 基礎配置
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // 2. 以 Next.js 為核心的配置 (相容舊版格式)
  ...compat.extends("next/core-web-vitals"),
  
  // 3. 擴展功能插件
  {
    plugins: {
      "jsx-a11y": jsxA11y,
      "import-x": importX,
      "unused-imports": unusedImports,
      "check-file": checkFile,
      tailwindcss: tailwind,
    },
    rules: {
      // --- Tailwind 優化 ---
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off",

      // --- 自動排序 Import ---
      "import-x/order": ["warn", { 
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }],

      // --- 自動清理未使用的 Imports ---
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
      ],

      // --- 檔案命名規範 ---
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{tsx,ts}": "PASCAL_CASE" },
        { "ignoreMiddleExtensions": true }
      ],
      "check-file/folder-naming-convention": [
        "error",
        { "src/**": "KEBAB_CASE" }
      ]
    },
  }
);