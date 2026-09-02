module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^miniApp/App$': '<rootDir>/__mocks__/MiniApp.tsx',
    '^cryptoApp/App$': '<rootDir>/__mocks__/CryptoApp.tsx',
  },
};
