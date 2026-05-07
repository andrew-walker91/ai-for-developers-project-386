# Деплой

## Dockerfile

- **Путь:** `apps/backend/Dockerfile`
- **Использует:** переменную окружения `PORT` (по умолчанию 5000)
- **База:** mcr.microsoft.com/dotnet/aspnet:8.0

## Локальная сборка

```bash
make docker
```

## Деплой на Render

### Вариант 1: Автоматически через GitHub Actions

1. Добавь в GitHub Secrets:
   - `RENDER_API_KEY` - получи на https://dashboard.render.com/api-keys
2. Запусти workflow `docker-build.yml`

### Вариант 2: Вручную

1. Зарегистрируйся на https://render.com
2. Создай "New Web Service"
3. Подключи GitHub репозиторий
4. Настрой:
   - Root Directory: `apps/backend`
   - Build Command: (пусто)
   - Start Command: (пусто)
   - Environment Variables: `PORT=10000`

---

## Публичная ссылка

Добавь ссылку после деплоя: