const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and other optimizations
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Optimize bundle size
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable bundle compression
config.transformer.enableBabelRCLookup = false;

// Exclude unnecessary files from bundle
config.resolver.blacklistRE = /node_modules\/.*\/(Pods|\.git)\/.*/;

// Asset optimization
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;