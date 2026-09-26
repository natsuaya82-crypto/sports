// App Store 配布用のプロビジョニングプロファイルを API で用意する。
//
// LLLLLLL / JJJJ では、プロファイルを Apple Developer の画面で手で作り、
// base64 にして Secret（PROVISIONING_PROFILE_BASE64）に入れていた。
// それは1年で切れ、切れると「Invalid Signature」で落ちる（LLLLLLL docs/apple.md §7）。
// ここでは毎回 API で確かめ、無いか切れかけなら作り直す。人の手は要らない。
//
// 入力（環境変数）:
//   P12_SERIAL   配布証明書（p12）のシリアル。ワークフローが openssl で取り出して渡す
//   PROFILE_PATH 書き出す .mobileprovision のパス
// 出力: profile_name（ExportOptions.plist と署名プラグインが使う）

import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';

import { APP_NAME, ascCall, ascJwt, BUNDLE_ID, setOutput } from './asc.mjs';

/** この日数より先に切れるものは作り直す。ビルド中やTestFlight配布中に切れないように */
const RENEW_BEFORE_DAYS = 14;

/** Apple と openssl でシリアルの書き方（先頭の0・大文字小文字）が違うので揃える */
function normalizeSerial(serial) {
  return serial.replace(/^serial=/i, '').replace(/^0+/, '').toUpperCase();
}

async function findBundleIdResource(token) {
  const found = await ascCall(
    token,
    'GET',
    `/bundleIds?filter[identifier]=${encodeURIComponent(BUNDLE_ID)}&limit=200`,
  );
  const exact = found.data.find((b) => b.attributes.identifier === BUNDLE_ID);
  if (!exact) throw new Error(`Bundle ID ${BUNDLE_ID} が未登録です。asc-bootstrap を先に実行してください`);
  return exact.id;
}

async function findCertificate(token, serial) {
  const found = await ascCall(
    token,
    'GET',
    '/certificates?filter[certificateType]=DISTRIBUTION,IOS_DISTRIBUTION&limit=200',
  );
  const certificate = found.data.find(
    (c) => normalizeSerial(c.attributes.serialNumber) === serial,
  );
  if (!certificate) {
    const known = found.data.map((c) => c.attributes.serialNumber).join(', ');
    throw new Error(
      `Secret の配布証明書（シリアル ${serial}）が App Store Connect に見つかりません。` +
        `登録されている配布証明書: ${known || 'なし'}。` +
        'DISTRIBUTION_P12_BASE64 が同じチームの、失効していない証明書か確認してください',
    );
  }
  return certificate;
}

function isUsable(profile) {
  const expires = new Date(profile.attributes.expirationDate).getTime();
  const threshold = Date.now() + RENEW_BEFORE_DAYS * 24 * 60 * 60 * 1000;
  return profile.attributes.profileState === 'ACTIVE' && expires > threshold;
}

async function ensureProfile(token, name, bundleIdResourceId, certificateId) {
  const found = await ascCall(
    token,
    'GET',
    `/profiles?filter[name]=${encodeURIComponent(name)}&limit=200`,
  );
  const existing = found.data.filter((p) => p.attributes.name === name);
  const usable = existing.find(isUsable);
  if (usable) {
    console.log(`既存のプロファイルを使います: ${name}（期限 ${usable.attributes.expirationDate}）`);
    return usable;
  }
  // 切れた・切れかけのものは消してから作る。同じ名前が複数あると Xcode がどれを使うか決まらない
  for (const stale of existing) {
    await ascCall(token, 'DELETE', `/profiles/${stale.id}`);
    console.log(`期限切れ・切れかけのプロファイルを削除しました: ${stale.id}`);
  }
  const created = await ascCall(token, 'POST', '/profiles', {
    data: {
      type: 'profiles',
      attributes: { name, profileType: 'IOS_APP_STORE' },
      relationships: {
        bundleId: { data: { type: 'bundleIds', id: bundleIdResourceId } },
        certificates: { data: [{ type: 'certificates', id: certificateId }] },
      },
    },
  });
  console.log(`プロファイルを作成しました: ${name}（期限 ${created.data.attributes.expirationDate}）`);
  return created.data;
}

const serial = normalizeSerial(process.env.P12_SERIAL ?? '');
const path = process.env.PROFILE_PATH;
if (!serial || !path) throw new Error('P12_SERIAL と PROFILE_PATH が必要です');

const token = ascJwt();
const certificate = await findCertificate(token, serial);
// 証明書を作り直したら別のプロファイルになるよう、名前に証明書のシリアルを入れる
const name = `${APP_NAME} AppStore ${serial.slice(-6)}`;
const profile = await ensureProfile(
  token,
  name,
  await findBundleIdResource(token),
  certificate.id,
);

writeFileSync(path, Buffer.from(profile.attributes.profileContent, 'base64'));
setOutput('profile_name', name);
