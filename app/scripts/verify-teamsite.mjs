// 公式サイトv3の確認: フル情報チーム(t1)とスカスカ情報チーム(t5)、セクションナビの動作
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. フル情報チーム(FC世田谷): ナビ+スタッツ+NEWS
await page.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/site_full.png` });

// 2. ナビの「フォト」をタップしてジャンプするか
await page.getByText('フォト', { exact: true }).first().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/site_nav_jump.png` });

// 3. 情報が少ないチーム(すぎなみMIX): 場所・人数・創設・戦績なしでも成立するか
await page.goto('http://localhost:8081/team/t5', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/site_sparse.png` });

await browser.close();
console.log('done');
