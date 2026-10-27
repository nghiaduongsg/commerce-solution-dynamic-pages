/* eslint-disable-next-line no-undef */
module.exports = {
  moduleDirectories: ['node_modules', 'packages'],
  modulePaths: ['<rootDir>'],
  testEnvironment: 'jsdom',
  /**
   * Source code root folder
   */
  roots: ['<rootDir>/packages'],

  /**
   * Jest transformations
   * Provide support for TypeScript using ts-jest
   */
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '.+\\.(css|styl|less|sass|scss)$': 'jest-transform-css',
  },

  /**
   * Runs special logic, such as cleaning up components when using React Testing Library
   * and adds special extended assertions to Jest
   */
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/packages/setupTests.ts'],

  /**
   * Test files resolution pattern
   */
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',

  /**
   * Module file extensions
   */
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  reporters: ['default', 'jest-junit'],

  testResultsProcessor: 'jest-junit',
  maxWorkers: 2,

  moduleNameMapper: {
    '@pkg-entity/utils/comparisonUtils': '<rootDir>/packages/__mocks__/comparisonUtils.ts',
    'react-i18next': '<rootDir>/packages/__mocks__/react-i18next.ts',
    i18next: '<rootDir>/packages/__mocks__/i18next.ts',
    '@pkg-setup/store': '<rootDir>/packages/__mocks__/setup-store.ts',
    'react-use': '<rootDir>/packages/__mocks__/react-use.ts',
    'lodash/debounce': '<rootDir>/packages/__mocks__/lodash-debounce.ts',
    '^@_jestHelpers(.*)$': '<rootDir>/packages/_jestHelpers$1',
    '^@pkg-common(.*)$': '<rootDir>/packages/common/src$1',
    '^@pkg-core(.*)$': '<rootDir>/packages/core$1',
    '^@pkg-setup(.*)$': '<rootDir>/packages/setup$1',
    '@pkg-list-types': '<rootDir>/packages/list/src/types.d.ts',
    '^@pkg-list(.*)$': '<rootDir>/packages/list$1',
    '^@pkg-entity(.*)$': '<rootDir>/packages/entity$1',
    '^@pkg-constants(.*)$': '<rootDir>/packages/constants$1',
    '^@pkg-form(.*)$': '<rootDir>/packages/form$1',
    '^@pkg-layout(.*)$': '<rootDir>/packages/layout$1',
  },
};
