// 分割編集フローの検証: メニュー→基本情報→保存→メニュー→カラー→サイト反映
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. マイページでFC世田谷に切替→編集メニュー
await page.goto('http://localhost:8081/mypage', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.getByText('個人として利用中').click();
await page.waitForTimeout(600);
await page.getByText('FC世田谷').last().click();
await page.waitForTimeout(600);
await page.getByText('編集する', { exact: true }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/edit2_menu.png` });

// 2. 基本情報を開いてキャッチコピー変更→保存
await page.getByText('基本情報', { exact: true }).click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/edit2_basic.png` });
await page.locator('input').nth(1).fill('緑の血が流れてる。');
await page.getByText('保存する', { exact: true }).click();
await page.waitForTimeout(800);

// 3. カラーを開いて赤に変更→保存
await page.getByText('チームカラー', { exact: true }).first().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/edit2_color.png` });

// 4. サイトで反映確認
await page.getByText('保存する', { exact: true }).click();
await page.waitForTimeout(600);
await page.getByText('公式サイトを確認する').click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/edit2_site.png` });

await browser.close();
console.log('done');
