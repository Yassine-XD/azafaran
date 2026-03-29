import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Override strict settings that can break tests
          strict: false,
          esModuleInterop: true,
        },
      },
    ],
  },
  setupFiles: ["<rootDir>/src/tests/setup.ts"],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  verbose: true,
};

export default config;
