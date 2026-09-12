const { withEntitlementsPlist, withXcodeProject } = require('expo/config-plugins');

// Put before expo-notifications: Expo executes entitlement mods in reverse registration order.
// FitIn schedules local reminders only. APNs is unused and blocks personal-team signing.
module.exports = (config) => {
  config = withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
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
