const { withEntitlementsPlist, withXcodeProject } = require('expo/config-plugins');
const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

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
  // Regenerating the native project wipes the team chosen in Xcode, so every prebuild otherwise
  // fails with "Signing requires a development team" until someone reopens the editor and picks it
  // again. FITIN_APPLE_TEAM_ID restores it automatically. It is read from the environment rather
  // than committed, because it identifies an Apple account and belongs in the local env file.
  const team = process.env.FITIN_APPLE_TEAM_ID;
  // Pressing Run in Xcode defaults to Debug, and a Debug build deliberately ships without a
  // JavaScript bundle so it can stream from Metro. On this project Metro is not part of the
  // workflow and port 8081 is taken by something else, so that build reaches the phone and dies
  // with "No script URL provided" and a white screen. Running Release instead produces a
  // standalone app that needs no server. Switch the scheme back to Debug when you actually want
  // fast refresh, and start Metro yourself.
  config = withXcodeProject(config, (config) => {
    const scheme = join(
      config.modRequest.platformProjectRoot,
      `${config.modRequest.projectName}.xcodeproj`,
      'xcshareddata',
      'xcschemes',
      `${config.modRequest.projectName}.xcscheme`,
    );
    if (existsSync(scheme)) {
      const xml = readFileSync(scheme, 'utf8').replace(
        /(<LaunchAction[\s\S]*?buildConfiguration\s*=\s*)"Debug"/,
        '$1"Release"',
      );
      writeFileSync(scheme, xml);
    }
    return config;
  });
  return withXcodeProject(config, (config) => {
    const sections = config.modResults.pbxXCBuildConfigurationSection();
    for (const entry of Object.values(sections)) {
      if (entry && typeof entry === 'object' && 'buildSettings' in entry) {
        entry.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
        if (team) entry.buildSettings.DEVELOPMENT_TEAM = team;
      }
    }
    return config;
  });
};
