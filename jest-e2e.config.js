module.exports = {
    testRegex: '.*\\.spec\\.ts$',
    moduleFileExtensions: ['s', 'tsx', 'js', 'json', 'ts'],
    // silent: true,
    preset: 'ts-jest',
    rootDir: '.',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        '/node_modules/'
    ]
}