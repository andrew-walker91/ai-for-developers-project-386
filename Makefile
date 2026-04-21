.PHONY: install dev dev-frontend dev-prism dev-backend build build-frontend build-typespec build-backend lint typecheck test docker

install:
	npm install

dev: build-typespec
	npx concurrently --kill-others "npx prism mock apps/backend/openapi.yaml" "npm run dev --prefix apps/frontend"

dev-frontend:
	cd apps/frontend && npx vite

dev-prism:
	cd packages/typespec && npx tsp compile . --emit @typespec/openapi3
	node -e "const fs=require('fs');const src='packages/typespec/tsp-output/@typespec/openapi3/openapi.yaml';const dst='apps/backend/openapi.yaml';if(fs.existsSync(src)){fs.copyFileSync(src,dst);console.log('Copied openapi.yaml');}else{console.error('openapi.yaml not found');process.exit(1);}"
	npx openapi-typescript apps/backend/openapi.yaml --output apps/frontend/src/api/schema.ts --enum
	npx prism mock -p 3000 apps/backend/openapi.yaml

dev-backend:
	cd apps/backend && dotnet run

build: build-typespec build-frontend

build-frontend:
	cd apps/frontend && npx vite build

build-typespec:
	cd packages/typespec && npx tsp compile . --emit @typespec/openapi3
	node -e "const fs=require('fs');const src='packages/typespec/tsp-output/@typespec/openapi3/openapi.yaml';const dst='apps/backend/openapi.yaml';if(fs.existsSync(src)){fs.copyFileSync(src,dst);console.log('Copied openapi.yaml');}else{console.error('openapi.yaml not found');process.exit(1);}"
	npx openapi-typescript apps/backend/openapi.yaml --output apps/frontend/src/api/schema.ts --enum

lint:
	cd apps/frontend && npx eslint src

typecheck:
	cd apps/frontend && npx tsc --noEmit

test: lint typecheck

build-backend:
	cd apps/backend && dotnet build

docker:
	cd apps/backend && docker build -t booking-api .
