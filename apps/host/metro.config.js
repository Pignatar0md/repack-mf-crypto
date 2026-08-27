const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration leftover from the React Native template.
 * This project bundles with Re.Pack (Rspack). See rspack.config.mjs
 * and react-native.config.js — `npm start` uses Re.Pack, not Metro.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
