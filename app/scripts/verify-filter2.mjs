// 絞りこみv2の検証: 競技チップ+新シート+適用結果
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. さがす画面(競技チップ常設)
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.getByText('サッカー', { exact: true }).first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/f2_sportchip.png` });

// 2. 絞りこみシートを開く
await page.getByText('絞りこみ', { exact: true }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/f2_sheet.png` });

// 3. 助っ人募集カード+夜を選んで適用
await page.getByText('その日だけ助っ人参加').click();
await page.waitForTimeout(300);
await page.getByText('夜', { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/f2_sheet_selected.png` });
await page.getByText(/件を表示/).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/f2_applied.png` });

await browser.close();
console.log('done');
