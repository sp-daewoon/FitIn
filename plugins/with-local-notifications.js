const { withEntitlementsPlist } = require('expo/config-plugins');

// Put before expo-notifications: Expo executes entitlement mods in reverse registration order.
// FitIn schedules local reminders only. APNs is unused and blocks personal-team signing.
module.exports = (config) => withEntitlementsPlist(config, (config) => {
  delete config.modResults['aps-environment'];
  return config;
});
