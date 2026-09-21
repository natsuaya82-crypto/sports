// 認証フローの検証: 未ログイン起動→ログイン画面→新規登録→デモ入場→ログアウト
// Playwrightは毎回まっさらなコンテキスト(localStorage空)なので未ログインで始まる
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. ホームを開いても未ログインならログイン画面に飛ばされる
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/auth_login.png` });

// 2. 新規登録画面
await page.getByText('新規登録', { exact: true }).click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/auth_signup.png` });

// 3. 戻ってデモアカウントで入る
await page.getByText('ログイン', { exact: true }).last().click();
await page.waitForTimeout(800);
await page.getByText('デモアカウントで入る').click();
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/auth_home.png` });

// 4. マイページ→設定→ログアウト→ログイン画面に戻る
await page.getByText('マイページ', { exact: true }).last().click();
await page.waitForTimeout(800);
await page.getByText('アカウント設定', { exact: true }).click();
await page.waitForTimeout(800);
await page.getByText('ログアウト', { exact: true }).click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/auth_loggedout.png` });

await browser.close();
console.log('done');
