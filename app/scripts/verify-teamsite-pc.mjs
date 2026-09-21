// 公式サイトのPC表示確認(TOP 2カラム、フォト4カラム、スマホ幅も退行していないか)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });

// PC幅
const pc = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await pc.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await pc.waitForTimeout(3500);
await pc.screenshot({ path: `${OUT}/pc_top.png` });
await pc.getByText('フォト', { exact: true }).first().click();
await pc.waitForTimeout(1000);
await pc.screenshot({ path: `${OUT}/pc_gallery.png` });

// スマホ幅の退行チェック
const sp = await browser.newPage({ viewport: { width: 390, height: 844 } });
await sp.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await sp.waitForTimeout(2500);
await sp.screenshot({ path: `${OUT}/sp_top_regression.png` });

await browser.close();
console.log('done');
