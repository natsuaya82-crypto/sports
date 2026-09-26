// ビルドの前に App Store Connect 側の前提を揃える。
//
// 1. Bundle ID（com.tokinets.sports）が無ければ API で登録する
// 2. その Bundle ID のアプリが App Store Connect にあるか確かめる
//
// アプリそのものは API では作れない（Apple が POST /v1/apps を提供していない）。
// 無ければ、人がやる手順を名指しして止まる。macOS で20分ビルドしたあとに
// アップロードで落ちるより、ここで数秒で止まったほうが安い。

import { APP_NAME, ascCall, ascJwt, BUNDLE_ID, setOutput } from './asc.mjs';

async function ensureBundleId(token) {
  const found = await ascCall(
    token,
    'GET',
    `/bundleIds?filter[identifier]=${encodeURIComponent(BUNDLE_ID)}&limit=200`,
  );
  // filter は前方一致でも返すことがあるので、完全一致で選ぶ
  const exact = found.data.find((b) => b.attributes.identifier === BUNDLE_ID);
  if (exact) {
    console.log(`Bundle ID は登録済み: ${BUNDLE_ID} (${exact.id})`);
    return exact.id;
  }
  const created = await ascCall(token, 'POST', '/bundleIds', {
    data: {
      type: 'bundleIds',
      attributes: { identifier: BUNDLE_ID, name: APP_NAME, platform: 'IOS' },
    },
  });
  console.log(`Bundle ID を登録しました: ${BUNDLE_ID} (${created.data.id})`);
  return created.data.id;
}

async function findApp(token) {
  const found = await ascCall(
    token,
    'GET',
    `/apps?filter[bundleId]=${encodeURIComponent(BUNDLE_ID)}`,
  );
  return found.data.find((a) => a.attributes.bundleId === BUNDLE_ID);
}

const token = ascJwt();
const bundleIdResourceId = await ensureBundleId(token);
setOutput('bundle_id_resource', bundleIdResourceId);

const app = await findApp(token);
if (!app) {
  console.log(`::error::App Store Connect に ${BUNDLE_ID} のアプリがありません。docs/RELEASE.md の「1回だけやること」の手順で作ってから、もう一度実行してください（Bundle ID は今の実行で登録済みなので、作成画面の一覧に出ます）`);
  process.exit(1);
}
console.log(`アプリを確認しました: ${app.attributes.name} (${app.id})`);
setOutput('app_id', app.id);
