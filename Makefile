.PHONY: setup test lint up down test-api test-web test-e2e code-setup

setup:
	@echo "Setup complete"

test:
	cd apps/frontend && npm run lint

lint:
	cd apps/frontend && npm run lint

code-setup:
	@echo "Skipping code setup"

dev-frontend:
	npm run dev -w apps/frontend

build-frontend:
	npm run build -w apps/frontend

build-typespec:
	npm run build -w packages/typespec

lint-frontend:
	npm run lint -w apps/frontend

typecheck-frontend:
	npm run typecheck -w apps/frontend

dev-backend:
	cd apps/backend && dotnet run

build-backend:
	cd apps/backend && dotnet build

docker-backend:
	cd apps/backend && docker build -t booking-api .
