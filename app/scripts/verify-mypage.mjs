// マイページの切り替えUIを実操作で確認するスクリプト(開発用)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8081/mypage', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// 1. アカウントカードをタップ → 切り替えシートが開く
await page.getByText('個人として利用中').click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/mypage_sheet.png` });

// 2. FC世田谷を選ぶ → チームモードに切り替わる
await page.getByText('FC世田谷').last().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/mypage_team.png` });

await browser.close();
console.log('done');
