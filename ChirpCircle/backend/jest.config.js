// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.(ts|js)'], // now matches both .test.ts and .test.js
  moduleFileExtensions: ['ts', 'js', 'json'],
};

