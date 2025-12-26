/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.mjs$": ["ts-jest", { tsconfig: { module: "esnext" } }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "**/__tests__/**/*.?(m)[jt]s?(x)",
    "**/?(*.)+(spec|test).?(m)[jt]s?(x)",
    "**/task_tests.tsx",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transformIgnorePatterns: [
    "node_modules/(?!@clerk)",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};
