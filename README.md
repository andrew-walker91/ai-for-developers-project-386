# 📅 Hexlet Calendar

Сервис для записи на встречи. Выбираешь тип встречи, смотришь свободные слоты, бронируешь. Всё как у людей, только без бесконечных переписок в мессенджерах.

### Hexlet tests and linter status:
[![Actions Status](https://github.com/andrew-walker91/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/andrew-walker91/ai-for-developers-project-386/actions)

## 🌐 Live Demo

Приложение живёт на Railway и доступно по ссылке:

👉 **[https://hexlet-calendar.up.railway.app](https://hexlet-calendar.up.railway.app)**

> Railway на бесплатном плане любит вздремнуть от бездействия. Если видите «синее окно смерти» — просто подождите 20–30 секунд, пока контейнер проснётся.

## 🧱 Stack

| Что | Чем |
|---|---|
| **Frontend** | React 19 + Mantine + Vite (TypeScript) |
| **Backend** | .NET 8 (C#) |
| **Database** | SQLite (не спрашивайте) |
| **API Contract** | TypeSpec → OpenAPI |
| **Container** | Multi-stage Dockerfile (фронт + бэк в одном образе) |
| **Deploy** | Railway |

## 🐳 Docker

```bash
docker build -t hexlet-calendar .
docker run -p 8080:8080 hexlet-calendar
```

Открой [http://localhost:8080](http://localhost:8080). Если приложение не загрузилось — проверь, не забыл ли ты запустить сам Docker. Бывает.

## 🛠 Локальная разработка

```bash
make install        # npm install
make dev-backend    # терминал 1: .NET бэкенд на :5000
make dev-frontend   # терминал 2: Vite dev server на :5173
make test           # линтер + тайпчек
make test-e2e       # Playwright e2e (бэкенд должен быть запущен)
```

Детали по архитектуре и командам — в [`AGENTS.md`](AGENTS.md).

## 🏗 Структура проекта

```
apps/
├── frontend/     # React SPA (Mantine + Vite)
├── backend/      # .NET 8 Web API
packages/
└── typespec/     # API контракт
```

## 🧪 CI

GitHub Actions проверяет качество кода и запускает e2e тесты.

---

Сделано с любовью и лёгкой паникой в рамках учебного проекта Hexlet.
