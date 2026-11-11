const express = require('express');
const { version } = require('./package.json');

const app = express();
app.disable('x-powered-by');

app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store').json({
    status: 'ok',
    service: 'srinipo-app',
    version,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  const timestamp = new Date().toISOString();
  res.set('Cache-Control', 'no-store').type('html').send(`<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>СРиНИПО · Вариант 17</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #101c2c; color: #edf4ff; font: 17px/1.6 system-ui, sans-serif; }
    main { max-width: 900px; margin: 8vh auto; padding: 32px; }
    .label { color: #77ddc5; font-size: 14px; letter-spacing: .12em; text-transform: uppercase; }
    h1 { font-size: clamp(32px, 6vw, 56px); line-height: 1.1; margin: 20px 0; }
    .intro { color: #bac9dc; max-width: 620px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin: 32px 0; }
    .card { padding: 24px; background: #1a2b42; border: 1px solid #344b66; border-radius: 14px; }
    .card p { margin: 0 0 8px; color: #bac9dc; font-size: 14px; }
    strong { font-size: 26px; }
    time { overflow-wrap: anywhere; }
    a { display: inline-block; padding: 12px 22px; background: #77ddc5; color: #102b28; border-radius: 8px; font-weight: 700; text-decoration: none; }
    a:focus-visible { outline: 3px solid white; outline-offset: 5px; }
    footer { margin-top: 32px; color: #bac9dc; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <div class="label">СРиНИПО / вариант 17</div>
    <h1>Приложение работает.</h1>
    <p class="intro">Учебный веб-сервис на Node.js и Express. Эта страница сформирована сервером внутри Docker-контейнера.</p>
    <section class="cards" aria-label="Информация о приложении">
      <div class="card"><p>Версия приложения</p><strong>${version}</strong></div>
      <div class="card"><p>Ответ сервера сформирован (UTC)</p><time datetime="${timestamp}">${timestamp}</time></div>
    </section>
    <a href="/health">Проверить /health →</a>
    <footer>Обновите страницу, чтобы получить новое время сервера.<br>GitHub · GitFlow · Linux · Docker</footer>
  </main>
</body>
</html>`);
});

if (require.main === module) {
  const port = Number(process.env.PORT || 80);
  app.listen(port, '0.0.0.0', () => console.log(`srinipo-app ${version} listening on port ${port}`));
}

module.exports = app;
