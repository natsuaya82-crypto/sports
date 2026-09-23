/**
 * iOS の配布用署名を、アプリ本体のターゲットにだけ入れる Expo の設定プラグイン。
 *
 * CI（.github/workflows/ios-deploy.yml）が `expo prebuild` するときにだけ効く。
 * 環境変数 APPLE_TEAM_ID と IOS_PROFILE_NAME が無ければ何もしない
 * （手元の `expo start` や、署名を持たない環境の prebuild を壊さない）。
 *
 * xcodebuild の引数で渡さないのは、引数の署名設定が CocoaPods の依存ライブラリにまで
 * 波及し「does not support provisioning profiles」で Archive が落ちるため。
 * LLLLLLL / JJJJ の ios-deploy.yml で実際に踏んだ失敗で、同じ理由で
 * pbxproj の本体ターゲットにだけ書く。
 */
const { withXcodeProject } = require('expo/config-plugins');

const SIGNING_IDENTITY = '"Apple Distribution"';

function applySigning(project, teamId, profileName) {
  const target = project.getFirstTarget();
  const configurationListId = target.firstTarget.buildConfigurationList;
  const configurationList = project.pbxXCConfigurationList()[configurationListId];
  const configurations = project.pbxXCBuildConfigurationSection();

  for (const { value } of configurationList.buildConfigurations) {
    const settings = configurations[value].buildSettings;
    settings.DEVELOPMENT_TEAM = teamId;
    settings.CODE_SIGN_STYLE = 'Manual';
    settings.CODE_SIGN_IDENTITY = SIGNING_IDENTITY;
    settings['"CODE_SIGN_IDENTITY[sdk=iphoneos*]"'] = SIGNING_IDENTITY;
    settings.PROVISIONING_PROFILE_SPECIFIER = `"${profileName}"`;
  }

  const attributes = project.getFirstProject().firstProject.attributes;
  attributes.TargetAttributes = attributes.TargetAttributes ?? {};
  attributes.TargetAttributes[target.uuid] = {
    ...attributes.TargetAttributes[target.uuid],
    DevelopmentTeam: teamId,
    ProvisioningStyle: 'Manual',
  };
}

module.exports = function withIosDistributionSigning(config) {
  return withXcodeProject(config, (modConfig) => {
    const teamId = process.env.APPLE_TEAM_ID;
    const profileName = process.env.IOS_PROFILE_NAME;
    if (teamId && profileName) {
      applySigning(modConfig.modResults, teamId, profileName);
    }
    return modConfig;
  });
};
