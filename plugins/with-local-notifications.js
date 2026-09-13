const { withEntitlementsPlist, withXcodeProject } = require('expo/config-plugins');

// Put before expo-notifications: Expo executes entitlement mods in reverse registration order.
// FitIn schedules local reminders only. APNs is unused and blocks personal-team signing.
//
// FITIN_PERSONAL_TEAM=1 additionally drops Sign in with Apple. A free personal Apple team cannot
// provision that capability, so Xcode refuses to build for a physical device at all. Dropping it
// trades one sign-in provider for the ability to run on a real phone before enrolling in the
// Apple Developer Program. It is opt-in and never applied to a production build, because shipping
// without the capability would remove a sign-in method users depend on.
module.exports = (config) => {
  const personalTeam =
    process.env.FITIN_PERSONAL_TEAM === '1' && process.env.FITIN_ENV !== 'production';
  config = withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    if (personalTeam && config.modResults['com.apple.developer.applesignin']) {
      delete config.modResults['com.apple.developer.applesignin'];
      console.warn(
        'FITIN_PERSONAL_TEAM=1: Sign in with Apple removed from this build. Apple sign-in will not work. Enroll in the Apple Developer Program and rebuild without the flag before testing or shipping it.',
      );
    }
    return config;
  });
  return withXcodeProject(config, (config) => {
    const sections = config.modResults.pbxXCBuildConfigurationSection();
    for (const entry of Object.values(sections)) {
      if (entry && typeof entry === 'object' && 'buildSettings' in entry)
        entry.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
    }
    return config;
  });
};
