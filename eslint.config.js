import js from "@eslint/js";
import babelParser from "@babel/eslint-parser";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist", "src-tauri"] },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: ["typescript", "jsx"],
          },
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      // TypeScript viene verificato da `tsc` (strict + noUnusedLocals/Parameters)
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
