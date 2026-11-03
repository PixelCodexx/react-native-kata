module.exports = {
  preset: "jest-expo",
  globalSetup: "<rootDir>/test/globalSetup.js",
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  testPathIgnorePatterns: ["/src/server/"],
  // First match wins: the SVG mock must precede the @assets alias, or aliased
  // SVG imports resolve to the asset stub (an object) instead of a component.
  moduleNameMapper: {
    "\\.svg$": "<rootDir>/test/svgMock.js",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@copy/(.*)$": "<rootDir>/src/copy/$1",
    "^@core-components/(.*)$": "<rootDir>/src/core-components/$1",
    "^@global-components/(.*)$": "<rootDir>/src/global-components/$1",
    "^@styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
};
