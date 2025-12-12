const { getDefaultConfig } = require('expo/metro-config');
require('dotenv').config();

const config = getDefaultConfig(__dirname);

// Ensure Metro can load WebAssembly modules used by expo-sqlite on web
config.resolver = config.resolver || {};
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes('wasm')) {
	config.resolver.assetExts.push('wasm');
}

module.exports = config;