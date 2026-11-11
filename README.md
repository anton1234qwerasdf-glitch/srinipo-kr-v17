# СРиНИПО — вариант 17

Учебный проект: GitHub, Node.js, GitFlow и Linux.

## Источник и доработка

Исходный пример: [studybsuir/Dev-course, каталог nodejs](https://github.com/studybsuir/Dev-course/tree/7b3ad948979b863a7d3cec577e142b4e061c3d83/nodejs).
Первоначальные app.js, package.json и Dockerfile сохранены в истории коммита `56ab4f01f1dfef13db2ae2058bf544240ac354d5`.

Версия 1.1.0 заменяет Hello World! страницей с версией приложения и текущим временем сервера (UTC).
Адрес `/health` возвращает JSON: status, service, version, uptimeSeconds и timestamp.
Это проверка ответа самого приложения, а не состояния внешних сервисов.

## Среда

Windows → WSL 2 → отдельная Ubuntu 24.04 LTS (SRINIPO) → Docker Engine.

## Сборка, тесты и предпросмотр

Из каталога проекта в Ubuntu:

```bash
sudo docker build -t srinipo-app:feature-health-check .
sudo docker run --rm srinipo-app:feature-health-check npm test
sudo docker run -d --name srinipo-preview -p 127.0.0.1:8889:80 srinipo-app:feature-health-check
```

Открыть http://localhost:8889 и http://localhost:8889/health.
Тесты отправляют настоящие HTTP-запросы: проверяют HTML, версию и время сервера, JSON состояния, а также ответ 404.
Если контейнер предпросмотра уже создан и остановлен: `sudo docker start srinipo-preview`.

Базовый образ Node.js закреплён по digest исходной ручной сборки; зависимости зафиксированы package-lock.json и устанавливаются через npm ci.
Закреплённые версии следует обновлять отдельно по мере необходимости.

## GitFlow и текущий этап

- `master` — стабильные выпуски.
- `develop` — интеграция изменений.
- `feature/health-check` — данная доработка.
- `release/*` — подготовка выпуска.
- `hotfix/*` — исправления выпущенной версии при необходимости.

Доработка проверяется отдельно на порту 8889. Исходный контейнер srinipo-web работает на порту 8888.
GitHub Actions и собственный Linux runner ещё не настроены; автоматического развёртывания пока нет.
