const versions = require('./docs/releases/versions.json');

// Native versions are independent of source/web. Expo prebuild reads this configuration.
module.exports = ({ config }) => ({
  ...config,
  version: process.env.FITIN_PLATFORM === 'ios' ? versions.ios.version : process.env.FITIN_PLATFORM === 'android' ? versions.android.version : config.version,
  ios: { ...config.ios, buildNumber: String(versions.ios.build) },
  android: { ...config.android, versionCode: versions.android.build },
});
