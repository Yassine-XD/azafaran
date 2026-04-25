require("dotenv").config();

// Provide minimum env values so config/env.ts validation does not exit.
// Tests that need real values should still set them in .env.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/azafaran_test";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "test_access_secret_must_be_at_least_32_characters_long";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "test_refresh_secret_must_be_at_least_32_characters_long_diff";

jest.setTimeout(30000);
