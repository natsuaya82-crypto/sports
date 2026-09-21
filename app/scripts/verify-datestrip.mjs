// 日付ストリップ(今日/明日表示・ドラッグスクロール)を実操作で確認するスクリプト(開発用)
import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '.';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// 1. 先頭マスが「今日」「明日」になっているか
const today = page.getByText('今日', { exact: true });
const tomorrow = page.getByText('明日', { exact: true });
console.log('今日 visible:', await today.isVisible());
console.log('明日 visible:', await tomorrow.isVisible());
await page.screenshot({ path: `${OUT}/datestrip_before.png` });

// 2. ストリップをマウスドラッグで左へスライド
const box = await today.boundingBox();
const y = box.y + box.height / 2;
await page.mouse.move(box.x + 150, y);
await page.mouse.down();
for (let i = 1; i <= 10; i++) {
  await page.mouse.move(box.x + 150 - i * 30, y);
  await page.waitForTimeout(30);
}
await page.mouse.up();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/datestrip_dragged.png` });

// 3. ドラッグ後に「今日」が画面外へ流れたか(スクロールできた証拠)
const boxAfter = await today.boundingBox();
console.log('今日 x before:', Math.round(box.x), '/ after:', boxAfter ? Math.round(boxAfter.x) : 'offscreen');

// 4. マスのタップがまだ効くか(ドラッグ対応でタップを潰していないか)
const cell20 = page.getByText('20', { exact: true }).first();
if (await cell20.isVisible()) {
  await cell20.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/datestrip_tapped.png` });
  console.log('tapped 20');
}

await browser.close();
console.log('done');
