const versions = require('./docs/releases/versions.json');
const { resolveEnvironment } = require('./config/environment.cjs');

// Native versions are independent of source/web. Expo prebuild reads this configuration.
module.exports = ({ config }) => {
  const environment = resolveEnvironment();
  return ({
  ...config,
  name: environment.name === 'production' ? 'FitIn' : 'FitIn Dev',
  scheme: environment.scheme,
  version: process.env.FITIN_PLATFORM === 'ios' ? versions.ios.version : process.env.FITIN_PLATFORM === 'android' ? versions.android.version : config.version,
  ios: { ...config.ios, bundleIdentifier: environment.appId, buildNumber: String(versions.ios.build) },
  android: { ...config.android, package: environment.appId, versionCode: versions.android.build },
  extra: { ...config.extra, environment: environment.name, backend: { url: environment.url, publishableKey: environment.key } },
});
};
