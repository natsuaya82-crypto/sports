// App Store Connect API の入口 ── JWT（ES256）と、一回の呼び出し。
//
// natsuaya82-crypto/LLLLLLL の tools/asc.mjs を流用している（鍵の読み方を揃えるため）。
// 鍵は環境変数 ASC_ISSUER_ID / ASC_KEY_ID / ASC_PRIVATE_KEY（.p8 の中身、または base64）。
// GitHub Actions では ios-deploy.yml が、LLLLLLL / JJJJ と同じ名前の Secrets から渡す。

import { Buffer } from 'node:buffer';
import { createPrivateKey, createSign } from 'node:crypto';
import { appendFileSync } from 'node:fs';

export const ASC_API = 'https://api.appstoreconnect.apple.com/v1';

export function ascJwt() {
  const iss = process.env.ASC_ISSUER_ID;
  const kid = process.env.ASC_KEY_ID;
  const pem = process.env.ASC_PRIVATE_KEY;
  if (!iss || !kid || !pem) {
    throw new Error(
      'ASC_ISSUER_ID / ASC_KEY_ID / ASC_PRIVATE_KEY が必要です。' +
        'リポジトリの Secrets に APP_STORE_CONNECT_ISSUER_ID / IOS_KEY_ID / IOS_API_KEY を入れてください',
    );
  }
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'ES256', kid, typ: 'JWT' });
  const body = b64({ iss, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' });
  const key = createPrivateKey(
    pem.includes('BEGIN') ? pem : Buffer.from(pem, 'base64').toString('utf8'),
  );
  const sig = createSign('SHA256')
    .update(`${head}.${body}`)
    .sign({ key, dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${sig.toString('base64url')}`;
}

/** 1回の呼び出し。失敗したら Apple の返したエラーを添えて投げる */
export async function ascCall(token, method, url, body) {
  const response = await fetch(url.startsWith('http') ? url : ASC_API + url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${url} -> ${response.status}\n${text.slice(0, 1200)}`);
  }
  return text === '' ? null : JSON.parse(text);
}

/** GitHub Actions の次のステップへ値を渡す */
export function setOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (file) appendFileSync(file, `${name}=${value}\n`);
  console.log(`${name}=${value}`);
}

export const BUNDLE_ID = 'com.tokinets.sports';
export const APP_NAME = 'sports';
