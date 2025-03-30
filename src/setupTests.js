// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IndexedDB
const indexedDB = {
  open: jest.fn().mockReturnValue({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: jest.fn(),
      objectStoreNames: {
        contains: jest.fn().mockReturnValue(true)
      },
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          put: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(),
          delete: jest.fn()
        })
      })
    }
  })
};

global.indexedDB = indexedDB;
