// エリア選択シート(47都道府県)を実操作で確認するスクリプト(開発用)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// 1. エリアバーをタップしてシートを開く
await page.getByText('東京', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/areasheet_open.png` });

// 2. 北海道と大阪を追加選択(シート内をスクロールしつつ)
await page.getByText('北海道', { exact: true }).click();
await page.getByText('大阪', { exact: true }).scrollIntoViewIfNeeded();
await page.getByText('大阪', { exact: true }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/areasheet_selected.png` });

// 3. 決定 → ヘッダーのラベルが変わるか
await page.getByText('で決定').click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/areasheet_applied.png` });
const label = await page.getByText('ほか', { exact: false }).first().textContent();
console.log('header label:', label);

await browser.close();
console.log('done');
