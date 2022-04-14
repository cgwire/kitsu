module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'js-3d-model-viewer': '<rootDir>/tests/substituted-model-viewer.js',
    'vue-slider-component': '<rootDir>/tests/substituted-model-viewer.js',
    fabric: '<rootDir>/tests/fabric.js',
    'vue-loading-spinner': '<rootDir>/tests/spinner.js',
    '@google/model-viewer': '<rootDir>/tests/substituted-model-viewer.js'
  },
  setupFiles: ['<rootDir>/tests/setup.js'],
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
}
