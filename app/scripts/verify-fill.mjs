// 空要素をモックで埋めた全画面を確認
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// デモログイン(セッション確立)
await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.getByText('デモアカウントで入る').click();
await page.waitForTimeout(2000);

const shots = [
  ['/scout', 'fill_scout'],
  ['/user/p1', 'fill_person'],
  ['/team/t1/applicants', 'fill_applicants'],
  ['/team/t1/members', 'fill_members'],
  ['/schedule', 'fill_schedule'],
  ['/notifications', 'fill_notifications'],
  ['/profile-edit', 'fill_profileedit'],
];

for (const [url, name] of shots) {
  await page.goto(`http://localhost:8081${url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

await browser.close();
console.log('done');
