const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Add any custom config here
const customConfig = {
    resolver: {
        // Make sure asset extensions are properly configured
        assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif','tflite'],
    },
};

// Merge the configs and wrap with Reanimated config
module.exports = wrapWithReanimatedMetroConfig(
    mergeConfig(config, customConfig)
);
