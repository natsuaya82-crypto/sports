// 公式サイト編集フローの検証: マイページ→チームに切替→編集→保存→サイトに反映
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. マイページでFC世田谷に切り替え
await page.goto('http://localhost:8081/mypage', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.getByText('個人として利用中').click();
await page.waitForTimeout(600);
await page.getByText('FC世田谷').last().click();
await page.waitForTimeout(600);

// 2. 編集画面を開く
await page.getByText('編集する', { exact: true }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/edit_screen.png` });

// 3. キャッチコピーを変更し、お知らせを追加
await page.locator('input').nth(1).fill('鍛えろ、世田谷魂。');
await page
  .getByPlaceholder('例: リーグ戦 5-1で勝利!')
  .fill('公式サイトをリニューアルしました');
await page.getByText('追加', { exact: true }).first().click();
await page.waitForTimeout(400);

// 4. 保存 → マイページに戻る → 公式サイトを開く
await page.getByText('保存してサイトに反映').click();
await page.waitForTimeout(800);
await page.getByText('公式サイトを見る').click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/edit_reflected.png` });

await browser.close();
console.log('done');
