.PHONY: help build up down restart logs test clean

help: ## Show this help message
	@echo "Face Recognition Service - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	docker-compose build

up: ## Start services
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@curl -s http://localhost:8000/health | python -m json.tool || echo "Service not ready yet, wait a few more seconds"

down: ## Stop services
	docker-compose down

restart: ## Restart services
	docker-compose restart

logs: ## Show logs (follow)
	docker-compose logs -f face-recognition

test: ## Run tests
	python test_service.py

test-images: ## Download sample test images
	python download_test_images.py

health: ## Check service health
	@curl -s http://localhost:8000/health | python -m json.tool

detect: ## Detect faces in test image (requires test_images/person1.jpg)
	@if [ -f test_images/person1.jpg ]; then \
		curl -X POST -F "file=@test_images/person1.jpg" http://localhost:8000/api/detect | python -m json.tool; \
	else \
		echo "❌ No test image found. Run 'make test-images' first"; \
	fi

analyze: ## Full analysis of test image (requires test_images/person1.jpg)
	@if [ -f test_images/person1.jpg ]; then \
		curl -X POST -F "file=@test_images/person1.jpg" http://localhost:8000/api/analyze | python -m json.tool; \
	else \
		echo "❌ No test image found. Run 'make test-images' first"; \
	fi

clean: ## Remove containers and volumes
	docker-compose down -v
	rm -rf test_images/

rebuild: ## Rebuild from scratch
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d

ps: ## Show running containers
	docker-compose ps

stats: ## Show container stats
	docker stats flowsint-face-recognition --no-stream

shell: ## Open shell in container
	docker exec -it flowsint-face-recognition bash

models: ## Check downloaded models
	docker exec flowsint-face-recognition ls -lh /root/.insightface/models/ || echo "Models not downloaded yet"

dev: ## Development mode (with hot reload)
	docker-compose up

prod: ## Production mode (detached)
	docker-compose -f docker-compose.yml up -d

deploy: ## Deploy to production server (requires SSH access)
	@echo "Deploying to production..."
	@echo "TODO: Add deployment script"

backup: ## Backup models and data
	docker exec flowsint-face-recognition tar czf /tmp/models-backup.tar.gz /root/.insightface/
	docker cp flowsint-face-recognition:/tmp/models-backup.tar.gz ./backups/models-$(shell date +%Y%m%d).tar.gz
	@echo "✅ Backup saved to backups/models-$(shell date +%Y%m%d).tar.gz"

install-deps: ## Install Python dependencies locally (for development)
	pip install -r requirements.txt

format: ## Format code with black
	black app/ main.py test_service.py

lint: ## Lint code with pylint
	pylint app/ main.py

docs: ## Open documentation
	@echo "Opening documentation..."
	@if command -v open >/dev/null 2>&1; then \
		open README.md; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open README.md; \
	else \
		echo "Please open README.md manually"; \
	fi
