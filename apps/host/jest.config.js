module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^miniApp/App$': '<rootDir>/__mocks__/MiniApp.tsx',
  },
};
