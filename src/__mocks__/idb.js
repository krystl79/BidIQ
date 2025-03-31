// Mock implementation of idb
const mockDB = {
  projects: new Map(),
  bids: new Map(),
  profiles: new Map(),
};

export const openDB = async () => ({
  transaction: (storeName, mode) => ({
    store: () => ({
      add: async (item) => {
        mockDB[storeName].set(item.id, item);
        return item.id;
      },
      put: async (item) => {
        mockDB[storeName].set(item.id, item);
        return item.id;
      },
      get: async (id) => mockDB[storeName].get(id),
      getAll: async () => Array.from(mockDB[storeName].values()),
      delete: async (id) => {
        mockDB[storeName].delete(id);
        return undefined;
      },
    }),
  }),
  objectStoreNames: {
    contains: (name) => ['projects', 'bids', 'profiles'].includes(name),
  },
  createObjectStore: (name) => {
    mockDB[name] = new Map();
    return {
      createIndex: () => {},
    };
  },
});

// Reset the mock database between tests
export const clearMockDB = () => {
  Object.keys(mockDB).forEach(key => {
    mockDB[key].clear();
  });
}; 