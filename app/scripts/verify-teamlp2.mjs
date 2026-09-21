// 公式サイト風チームLPの表示確認(上部と下部、別チームの色違いも)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// FC世田谷(緑)上部
await page.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/lp2_top.png` });

// 下までスクロール
await page.mouse.wheel(0, 1200);
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/lp2_bottom.png` });

// 別チーム(紫のIKEBUKURO HOOPS)で色が変わるか
await page.goto('http://localhost:8081/team/t3', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/lp2_hoops.png` });

await browser.close();
console.log('done');
