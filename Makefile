.PHONY: help setup run stop clean migrate superuser

help:
	@echo "EduPlatform Commands:"
	@echo "  make setup       - Proyektni to'liq o'rnatish"
	@echo "  make run         - Ishga tushirish"
	@echo "  make stop        - To'xtatish"
	@echo "  make migrate     - Migratsiya"
	@echo "  make superuser   - Superuser yaratish"

setup:
	@echo "🚀 Proyekt o'rnatilmoqda..."
	cd backend && python -m venv venv
	cd backend && . venv/bin/activate && pip install -r requirements.txt
	cd frontend && npm install
	@echo "✅ O'rnatish tugadi!"

run:
	docker-compose up -d
	@echo "✅ Ishga tushdi: http://localhost:8000"

stop:
	docker-compose down

migrate:
	docker-compose exec backend python manage.py migrate

superuser:
	docker-compose exec backend python manage.py createsuperuser