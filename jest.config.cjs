// jest.config.cjs
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',   // ESM + TS support
  testEnvironment: 'node',

  // Look for tests anywhere under /src
  roots: ['<rootDir>/src'],

  // Any `.test.ts` file
  testMatch: ['**/*.test.ts'],

  // Transform TS via ts-jest
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Treat .ts as ESM
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },

  // Recognize these extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
};
