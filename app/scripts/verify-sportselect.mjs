// 競技プルダウンの検証: ボタン→シート→選択→絞り込み反映
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/ss_header.png` });

// プルダウンを開く
await page.getByText('競技', { exact: true }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/ss_sheet.png` });

// サッカーを選択
await page.getByText('サッカー', { exact: true }).last().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/ss_selected.png` });

await browser.close();
console.log('done');
