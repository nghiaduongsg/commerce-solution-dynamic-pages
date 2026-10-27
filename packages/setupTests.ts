// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for react-router v7
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

global['window'] =
  global['window'] ||
  function () {
    return {
      location: {
        href: 'http://localhost',
      },
    };
  };
global['matchMedia'] =
  global['matchMedia'] ||
  function () {
    return {
      matches: false,
      addListener: () => 0,
      removeListener: () => 0,
    };
  };
