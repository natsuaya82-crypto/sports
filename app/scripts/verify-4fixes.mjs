// 4点修正の検証: ヘッダー均等/シート非スクロール/メンバー募集(常設)/募集フォーム
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. ヘッダー3ボタン
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/fix_header.png` });

// 2. 絞りこみシート(スクロールなしで全部見えるか)
await page.getByText('絞りこみ', { exact: true }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/fix_sheet.png` });
await page.mouse.click(195, 100); // 閉じる

// 3. 募集する→メンバー募集(常設)
await page.waitForTimeout(600);
await page.getByText('募集する', { exact: true }).last().click();
await page.waitForTimeout(1200);
await page.getByText('メンバー募集', { exact: true }).last().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/fix_member_post.png` });

// 4. 掲載→公式サイトの募集ページで確認
await page
  .getByPlaceholder(/DF・GK急募/)
  .fill('選手募集!ポジション不問、経験者優遇。まずは体験からどうぞ。');
await page.getByText('公式サイトに掲載する').click();
await page.waitForTimeout(1500);
await page.getByText('募集', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/fix_member_site.png` });

await browser.close();
console.log('done');
