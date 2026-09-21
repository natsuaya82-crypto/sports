// 切替廃止の検証: デモログイン→マイページ(自分固定+運営チーム一覧)→チーム管理へ
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// ログイン
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.getByText('デモアカウントで入る').click();
await page.waitForTimeout(2000);

// マイページ
await page.getByText('マイページ', { exact: true }).last().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/ns_mypage.png` });

// FC世田谷の管理画面へ(セッションは保持されている)
await page.goto('http://localhost:8081/team/t1/manage', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/ns_manage.png` });

await browser.close();
console.log('done');
