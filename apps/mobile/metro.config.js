const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// pnpm's node_modules relies on symlinks into its content-addressable store;
// Metro doesn't follow them by default, which breaks resolving a dependency's
// own transitive deps (e.g. nativewind/jsx-runtime -> react-native-css-interop).
config.resolver.unstable_enableSymlinks = true;

module.exports = withNativeWind(config, { input: './src/global.css' });
