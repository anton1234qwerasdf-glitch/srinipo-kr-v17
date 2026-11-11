# СРиНИПО — вариант 17

Учебный проект: GitHub, Node.js, GitFlow и Linux.

## Исходное приложение

Пример Node.js/Express из [studybsuir/Dev-course](https://github.com/studybsuir/Dev-course/tree/7b3ad948979b863a7d3cec577e142b4e061c3d83/nodejs), коммит `7b3ad948979b863a7d3cec577e142b4e061c3d83`.
Исходные `app.js`, `package.json` и `Dockerfile` сохранены без изменений. Приложение возвращает `Hello World!` на `/` и слушает порт 80 внутри контейнера.

## Среда и ручной запуск

Windows → WSL 2 → отдельная Ubuntu 24.04 LTS (SRINIPO) → Docker Engine.
Из каталога проекта в Ubuntu:

```bash
sudo docker build -t srinipo-app:initial .
sudo docker run -d --name srinipo-web -p 127.0.0.1:8888:80 srinipo-app:initial
```

Открыть http://localhost:8888. Если контейнер уже создан и остановлен: `sudo docker start srinipo-web`.

## План GitFlow

- `master` — стабильные выпуски.
- `develop` — интеграция изменений.
- `feature/*` — отдельные доработки.
- `release/*` — подготовка выпуска.
- `hotfix/*` — исправления выпущенной версии при необходимости.

Следующие этапы: модернизация приложения, проверка `/health`, настройка GitHub Actions и собственного Linux runner. Автоматическое развёртывание пока не настроено.
