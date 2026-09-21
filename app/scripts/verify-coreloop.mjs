// コアループ検証: カードタップ→詳細→おきにいり+応募→チャット→メッセージ一覧→応募履歴→おきにいりタブ
// メモリ上ストアを維持するため、リロードせずアプリ内ナビゲーションだけで回る
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. さがす → 最初の募集カードをタップ → 詳細
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.getByText('【FC世田谷】助っ人DF・GK募集!リーグ戦').first().click();
await page.waitForTimeout(1500);

// 2. おきにいり(写真右上のハート)を押してから応募
await page.mouse.click(366, 26);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/loop_detail.png` });
await page.getByText('この募集に応募する').click();
await page.waitForTimeout(1200);

// 3. チャットでメッセージ送信
await page.getByPlaceholder('メッセージを入力').fill('日曜は空いてます!');
await page.getByPlaceholder('メッセージを入力').press('Enter');
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/loop_chat.png` });

// 4. 戻る(チャット→詳細→さがす)
await page.mouse.click(22, 26);
await page.waitForTimeout(600);
await page.mouse.click(24, 26);
await page.waitForTimeout(800);

// 5. メッセージタブ
await page.getByText('メッセージ', { exact: true }).last().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/loop_messages.png` });

// 6. おきにいりタブ
await page.getByText('おきにいり', { exact: true }).last().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/loop_favorites.png` });

await browser.close();
console.log('done');
