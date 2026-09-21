// チームLPの表示と導線を実操作で確認するスクリプト(開発用)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. チームでさがす → FC世田谷をタップ → LPへ遷移(導線確認)
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.getByText('チームでさがす').click();
await page.waitForTimeout(800);
await page.getByText('FC世田谷').first().click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/teamlp_light.png` });

// 2. ダークに切り替えてLPを直接開く
await page.goto('http://localhost:8081/settings', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.getByText('ダーク', { exact: true }).click();
await page.waitForTimeout(500);
await page.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/teamlp_dark.png` });

// 後片付け: ライトに戻す
await page.goto('http://localhost:8081/settings', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.getByText('端末の設定に合わせる').click();
await page.waitForTimeout(500);

await browser.close();
console.log('done');
