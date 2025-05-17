let cache = {};

const AsyncStorage = {
  setItem: jest.fn((key, value) => {
    return new Promise((resolve) => {
      cache[key] = value;
      resolve(null);
    });
  }),
  getItem: jest.fn((key) => {
    return new Promise((resolve) => {
      resolve(cache[key] || null);
    });
  }),
  removeItem: jest.fn((key) => {
    return new Promise((resolve) => {
      delete cache[key];
      resolve(null);
    });
  }),
  clear: jest.fn(() => {
    return new Promise((resolve) => {
      cache = {};
      resolve(null);
    });
  }),
  getAllKeys: jest.fn(() => {
    return new Promise((resolve) => {
      resolve(Object.keys(cache));
    });
  }),
  multiGet: jest.fn((keys) => {
    return new Promise((resolve) => {
      const result = keys.map(key => [key, cache[key] || null]);
      resolve(result);
    });
  }),
  multiSet: jest.fn((keyValuePairs) => {
    return new Promise((resolve) => {
      keyValuePairs.forEach(([key, value]) => {
        cache[key] = value;
      });
      resolve(null);
    });
  }),
  multiRemove: jest.fn((keys) => {
    return new Promise((resolve) => {
      keys.forEach(key => {
        delete cache[key];
      });
      resolve(null);
    });
  }),
};

export default AsyncStorage;