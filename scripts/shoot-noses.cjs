// Снимает страницу каждого зверя в режиме «нос крупно» — ровно то,
// что увидит ребёнок. Проверять кропы файлами оказалось недостаточно:
// на странице кадр показывается кругом, и срез видно только здесь.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2];
const ids = JSON.parse(fs.readFileSync('content/animals.json', 'utf8')).map(a => a.id);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 880 } });
  for (const id of ids) {
    const p = await ctx.newPage();
    await p.goto('http://localhost:5173/animal/' + id, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(700);
    await p.click('.nose-btn', { force: true });
    await p.waitForTimeout(1000);
    const el = await p.$('.animal-grid > div');
    await el.screenshot({ path: `${OUT}/${id}.png` });
    await p.close();
  }
  await b.close();
  console.log('снято', ids.length);
})();
