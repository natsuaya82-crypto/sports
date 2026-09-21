// ホームページ完成度チェック: TOP次戦カード、日程・結果、メンバー、参加の流れ
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/hp_top.png` });

await page.getByText('日程・結果', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/hp_schedule.png` });

await page.getByText('メンバー', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/hp_members.png` });

await page.getByText('募集', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/hp_recruit.png` });

// PC幅でTOP
const pc = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await pc.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await pc.waitForTimeout(2500);
await pc.screenshot({ path: `${OUT}/hp_pc_top.png` });

await browser.close();
console.log('done');
