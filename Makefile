.PHONY: setup dev-frontend build-frontend build-typespec lint-frontend typecheck-frontend dev-backend build-backend docker-backend

setup:
	npm install

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
