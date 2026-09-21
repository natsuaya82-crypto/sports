// LP下部(ギャラリー・SNS・フッター)の表示確認
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8081/team/t1', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

// RN-webのScrollViewはdiv要素なので、要素を直接スクロールする
await page.evaluate(() => {
  const scrollers = [...document.querySelectorAll('div')].filter(
    (d) => d.scrollHeight > d.clientHeight + 100,
  );
  for (const s of scrollers) s.scrollTop = s.scrollHeight;
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/lp3_bottom.png` });

await browser.close();
console.log('done');
