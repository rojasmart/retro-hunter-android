const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Create a config that explicitly excludes the problem file
const config = getDefaultConfig(__dirname);

// More specific approach - explicitly list the problematic file path
const problemFilePath = "/home/rogerio/.nvm/versions/node/v22.14.0/lib/node_modules/@expo/cli/build/metro-require/require.js";

// Define explicit project root and block global node_modules
config.projectRoot = path.resolve(__dirname);
config.watchFolders = [path.resolve(__dirname, "node_modules")];
config.resolver.blockList = [new RegExp(problemFilePath.replace(/\//g, "\\/").replace(/\./g, "\\."))];

module.exports = config;
