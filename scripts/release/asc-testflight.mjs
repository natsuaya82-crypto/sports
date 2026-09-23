// TestFlight の内部テストを用意する。
//
// LLLLLLL の docs/apple.md §1 では、ビルドのたびに画面で
// 「内部テスト → グループを作る → ビルドを追加 → 自分のメールを入れる」をしていた。
// ここでは「すべてのビルドを自動で配る」内部グループを API で1回作り、テスターを入れる。
// 以後は新しいビルドが処理を終えた時点で、手を触れずに TestFlight に届く。
//
// 入力（環境変数）:
//   APP_ID                  asc-bootstrap が出したアプリのID
//   TESTFLIGHT_TESTER_EMAIL テスターのメール（任意）。リポジトリの Variables に置く。
//                           公開リポジトリなのでコードやファイルには書かない
//
// 内部テスターは App Store Connect のユーザーでなければならない（Apple の制約）。
// 入れられなかったときはビルド自体は成功しているので、落とさずに手順を案内する。

import { ascCall, ascJwt } from './asc.mjs';

const GROUP_NAME = '内部テスト';

async function ensureInternalGroup(token, appId) {
  const found = await ascCall(token, 'GET', `/apps/${appId}/betaGroups?limit=200`);
  const existing = found.data.find(
    (g) => g.attributes.isInternalGroup && g.attributes.name === GROUP_NAME,
  );
  if (existing) {
    if (!existing.attributes.hasAccessToAllBuilds) {
      await ascCall(token, 'PATCH', `/betaGroups/${existing.id}`, {
        data: { type: 'betaGroups', id: existing.id, attributes: { hasAccessToAllBuilds: true } },
      });
      console.log(`「${GROUP_NAME}」を、すべてのビルドを自動で配る設定にしました`);
    }
    return existing.id;
  }
  const created = await ascCall(token, 'POST', '/betaGroups', {
    data: {
      type: 'betaGroups',
      attributes: { name: GROUP_NAME, isInternalGroup: true, hasAccessToAllBuilds: true },
      relationships: { app: { data: { type: 'apps', id: appId } } },
    },
  });
  console.log(`内部テストグループ「${GROUP_NAME}」を作成しました（すべてのビルドを自動で配る）`);
  return created.data.id;
}

async function addTester(token, groupId, email) {
  const found = await ascCall(
    token,
    'GET',
    `/betaTesters?filter[email]=${encodeURIComponent(email)}&limit=1`,
  );
  const tester = found.data[0];
  if (tester) {
    await ascCall(token, 'POST', `/betaGroups/${groupId}/relationships/betaTesters`, {
      data: [{ type: 'betaTesters', id: tester.id }],
    });
  } else {
    await ascCall(token, 'POST', '/betaTesters', {
      data: {
        type: 'betaTesters',
        attributes: { email },
        relationships: { betaGroups: { data: [{ type: 'betaGroups', id: groupId }] } },
      },
    });
  }
  console.log('テスターを内部テストグループに入れました');
}

const appId = process.env.APP_ID;
if (!appId) throw new Error('APP_ID が必要です');

const token = ascJwt();
const groupId = await ensureInternalGroup(token, appId);

const email = process.env.TESTFLIGHT_TESTER_EMAIL;
if (!email) {
  console.log(
    '::notice::TESTFLIGHT_TESTER_EMAIL が未設定なのでテスターは追加していません。' +
      'App Store Connect → TestFlight → 内部テスト で自分を追加するか、' +
      'リポジトリの Settings → Variables に TESTFLIGHT_TESTER_EMAIL を入れてください',
  );
} else {
  try {
    await addTester(token, groupId, email);
  } catch (error) {
    console.log(
      '::warning::テスターを追加できませんでした。内部テスターは App Store Connect の' +
        'ユーザーである必要があります。App Store Connect → TestFlight → 内部テスト で追加してください。\n' +
        String(error),
    );
  }
}
