// マルチページ公式サイトの確認: TOP、メニューでページ切替、情報少なめチーム
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. TOPページ(FC世田谷)
await page.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/site2_top.png` });

// 2. メニューから「募集」ページへ
await page.getByText('募集', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/site2_recruit.png` });

// 3. 「チーム情報」ページへ
await page.getByText('チーム情報', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/site2_about.png` });

// 4. 情報が少ないチーム(すぎなみMIX)のTOP
await page.goto('http://localhost:8081/team/t5', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/site2_sparse.png` });

await browser.close();
console.log('done');
