/** @type {import('jest').Config} */
module.exports = {
    clearMocks: true,
    setupFilesAfterEnv: [
        '<rootDir>/.config/jest.setup.ts'
    ],
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '\\.[jt]sx?$': 'babel-jest'
    },
    testPathIgnorePatterns: [
        'dist/',
        'node_modules/'
    ],
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': '<rootDir>/test/__mocks__/style-mock.ts'
    },
    snapshotResolver: '<rootDir>/.config/jest.snapshot-resolver.ts',
    coverageDirectory: '<rootDir>/reports'
}
