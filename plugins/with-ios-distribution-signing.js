/**
 * iOS の配布用署名を、アプリ本体のターゲットにだけ入れる Expo の設定プラグイン。
 *
 * CI（.github/workflows/ios-deploy.yml）が `expo prebuild` するときにだけ効く。
 * APPLE_TEAM_ID が無ければ何もしない
 * （手元の `expo start` や、署名を持たない環境の prebuild を壊さない）。
 *
 * 署名のしかたは2通り（docs/RELEASE.md）:
 * - IOS_PROFILE_NAME あり: 配布証明書（p12）とプロファイルで手動署名
 * - IOS_PROFILE_NAME なし: 自動署名。xcodebuild が App Store Connect API の鍵で
 *   Apple のクラウド署名を使う。p12 が要らない
 *
 * xcodebuild の引数で渡さないのは、引数の署名設定が CocoaPods の依存ライブラリにまで
 * 波及し「does not support provisioning profiles」で Archive が落ちるため。
 * LLLLLLL / JJJJ の ios-deploy.yml で実際に踏んだ失敗で、同じ理由で
 * pbxproj の本体ターゲットにだけ書く。
 */
const { withXcodeProject } = require('expo/config-plugins');

const SIGNING_IDENTITY = '"Apple Distribution"';

function applySigning(project, teamId, profileName) {
  const manual = Boolean(profileName);
  const target = project.getFirstTarget();
  const configurationListId = target.firstTarget.buildConfigurationList;
  const configurationList = project.pbxXCConfigurationList()[configurationListId];
  const configurations = project.pbxXCBuildConfigurationSection();

  for (const { value } of configurationList.buildConfigurations) {
    const settings = configurations[value].buildSettings;
    settings.DEVELOPMENT_TEAM = teamId;
    settings.CODE_SIGN_STYLE = manual ? 'Manual' : 'Automatic';
    if (manual) {
      settings.CODE_SIGN_IDENTITY = SIGNING_IDENTITY;
      settings['"CODE_SIGN_IDENTITY[sdk=iphoneos*]"'] = SIGNING_IDENTITY;
      settings.PROVISIONING_PROFILE_SPECIFIER = `"${profileName}"`;
    }
  }

  const attributes = project.getFirstProject().firstProject.attributes;
  attributes.TargetAttributes = attributes.TargetAttributes ?? {};
  attributes.TargetAttributes[target.uuid] = {
    ...attributes.TargetAttributes[target.uuid],
    DevelopmentTeam: teamId,
    ProvisioningStyle: manual ? 'Manual' : 'Automatic',
  };
}

module.exports = function withIosDistributionSigning(config) {
  return withXcodeProject(config, (modConfig) => {
    const teamId = process.env.APPLE_TEAM_ID;
    if (teamId) {
      applySigning(modConfig.modResults, teamId, process.env.IOS_PROFILE_NAME);
    }
    return modConfig;
  });
};
