// jest-unit.config.js

module.exports = {
    // silent: true,
    preset: 'ts-jest',
    moduleFileExtensions: ['s', 'tsx', 'js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.test\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        '/node_modules/'
    ]
};