# Деплой

## Dockerfile

- **Путь:** `Dockerfile` (в корне репозитория)
- **Использует:** переменную окружения `PORT` (по умолчанию 8080)
- **База:** mcr.microsoft.com/dotnet/aspnet:8.0

## Локальная сборка

```bash
make docker
```

## Деплой на Railway

### Автоматически через GitHub Actions

1. Добавь в GitHub Secrets:
   - `RAILWAY_TOKEN` — получи на https://railway.com/account/tokens
   - `RAILWAY_SERVICE_ID` — ID сервиса в Railway
2. Пуш в ветку `main` запустит workflow `deploy.yml`

### Вручную

1. Зарегистрируйся на https://railway.com
2. Создай "New Project" → "Deploy from GitHub repo"
3. Подключи репозиторий
4. Railway автоматически определит Dockerfile и соберёт проект
5. Добавь переменную окружения `PORT=8080` в настройках сервиса

---

## Публичная ссылка

https://hexlet-calendar.up.railway.app
