// 設定画面からダークモードに切り替わるかを実操作で確認するスクリプト(開発用)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. マイページ → アカウント設定
await page.goto('http://localhost:8081/mypage', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.getByText('アカウント設定').click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/settings_light.png` });

// 2. ダークを選択
await page.getByText('ダーク', { exact: true }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/settings_dark.png` });

// 3. 戻ってさがす画面もダークになっているか
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/home_dark.png` });

await browser.close();
console.log('done');
