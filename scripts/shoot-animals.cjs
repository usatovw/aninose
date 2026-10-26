// Снимает страницу каждого зверя как её видит ребёнок: силуэт или стикер.
// Силуэты я тоже судил мелкими миниатюрами и пропустил развалившегося
// носача — голова отдельно от тела. Смотреть надо здесь.
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
    
    await p.waitForTimeout(900);
    const el = await p.$('.animal-grid > div');
    await el.screenshot({ path: `${OUT}/${id}.png` });
    await p.close();
  }
  await b.close();
  console.log('снято', ids.length);
})();
