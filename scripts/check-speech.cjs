// Ловит обрывы речи: любая реплика, остановленная до конца, — дефект.
// Переход на новую страницу запускал своё объявление поверх предыдущего,
// и «Это мокрый носи...» обрывалось на полуслове.
const { chromium } = require('playwright');

const STEPS = [
  { name: 'заставка',            go: '/' },
  { name: 'кнопка «Смотреть»',   click: '.btn' },
  { name: 'домик «Мокрый нос»',  click: '.house' },
  { name: 'зверь из домика',     click: '.beast' },
  { name: 'кнопка «Дальше»',     click: '.btn:not(.btn--quiet)' },
  { name: 'альбом',              go: '/album' },
  { name: 'игра',                go: '/game' },
];

(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await (await b.newContext({ viewport: { width: 1366, height: 880 } })).newPage();
  const cut = [], played = [];
  await p.exposeFunction('mark', (ev, src) => (ev === 'cut' ? cut : played).push(src));
  await p.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const name = (this.src || '').split('/').pop();
      if ((this.src || '').includes('/voice/')) {
        window.mark('play', name);
        this.addEventListener('pause', () => {
          // паузу ставит только наш код, когда начинает новую реплику
          if (!this.ended && this.currentTime > 0.15) window.mark('cut', name);
        }, { once: true });
      }
      return play.call(this);
    };
  });

  for (const s of STEPS) {
    if (s.go) await p.goto('http://localhost:5173' + s.go, { waitUntil: 'domcontentloaded' });
    else await p.click(s.click, { force: true });
    await p.waitForTimeout(5200);     // даём реплике договорить
  }
  await b.close();
  console.log('реплик прозвучало:', played.length);
  console.log(cut.length ? 'ОБОРВАНО: ' + [...new Set(cut)].join(', ') : 'обрывов нет');
})();
