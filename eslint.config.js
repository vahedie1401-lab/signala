import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ["**/*.ts"],

    rules: {
      "no-console": "error",

      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",

        {
          argsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
