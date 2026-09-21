// 募集作成フォーム → さがすに反映、を実操作で確認するスクリプト(開発用)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8081/post', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/post_empty.png` });

// 1. フォーム入力(競技・タイプ・タイトル・会場名が必須)
await page.getByText('フットサル', { exact: true }).click();
await page.getByText('体験参加OK', { exact: true }).click();
await page.getByPlaceholder(/日曜午前のエンジョイ/).fill('テスト投稿!金曜夜のゆるフットサル');
await page.getByPlaceholder(/会場名/).fill('駒沢公園フットサルコート');
await page.getByText('エンジョイ', { exact: true }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/post_filled.png` });

// 2. 作成
await page.getByText('この内容で募集する').click();
await page.waitForTimeout(1500);

// 3. さがすタブに遷移して、作成した募集が出ているか
await page.screenshot({ path: `${OUT}/post_result.png` });
const created = page.getByText('テスト投稿!金曜夜のゆるフットサル');
console.log('created card visible:', await created.first().isVisible());

await browser.close();
console.log('done');
