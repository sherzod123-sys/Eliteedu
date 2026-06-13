# 🎓 EduPlatform - Multi-Tenant O'quv Platformasi

Professional o'quv markazlari uchun zamonaviy online ta'lim platformasi.

## 🚀 Xususiyatlar

- 📱 Telefon raqam bilan kirish
- 👨‍🎓 Talabalar boshqaruvi
- 👨‍🏫 O'qituvchilar paneli
- 💼 Admin panel
- 📊 Analytics va hisobotlar
- 💳 To'lov integratsiyasi (Payme, Click)
- 📧 Notifikatsiyalar (Email, SMS, Telegram)
- 🎥 Video darslar
- 📝 Testlar va sertifikatlar
- 🏆 Gamification (badges, points)

## 📋 Talablar

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)

## ⚡ Tez ishga tushirish (Docker)

```bash
# Proyektni clone qilish
git clone https://github.com/yourrepo/eduplatform.git
cd eduplatform

# Ishga tushirish
docker-compose up -d

# Migratsiya
docker-compose exec backend python manage.py migrate

# Superuser yaratish
docker-compose exec backend python manage.py createsuperuser

# Sayt: http://localhost:8000
# Admin: http://localhost:8000/admin
```

## 🛠️ Manual setup

### Backend

```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencies
pip install -r requirements.txt

# .env file
cp .env.example .env
# .env ni tahrirlang

# Database
python manage.py migrate

# Superuser
python manage.py createsuperuser

# Ishga tushirish
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Dependencies
npm install

# .env file
cp .env.example .env

# Ishga tushirish
npm start
```

## 📱 Test Akkauntlar

```
Admin: +998901234567 / 4567
Teacher: +998901234568 / 4568
Student: +998901234569 / 4569
```

## 📚 API Documentation

- Swagger: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Coverage
pytest --cov
```

## 📦 Deploy

Batafsil yo'riqnoma: [DEPLOY.md](docs/DEPLOY.md)

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating
3. Commit qiling
4. Push qiling
5. Pull Request oching

## 📞 Qo'llab-quvvatlash

- Email: support@eduplatform.uz
- Telegram: @eduplatform_support

## 📄 Litsenziya

Proprietary - Barcha huquqlar himoyalangan

---

**Made with ❤️ in Uzbekistan**