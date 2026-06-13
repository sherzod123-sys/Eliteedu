# ---- Frontend build stage ----
FROM node:18 AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV CI=false
RUN npm run build

# ---- Backend stage ----
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    gcc \
    g++ \
    python3-dev \
    musl-dev \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/
RUN pip install --upgrade pip 'setuptools<81' wheel && \
    pip install -r requirements.txt

COPY backend/ /app/

# React build natijasini joylashtiramiz
COPY --from=frontend-build /frontend/build /app/frontend/build

RUN mkdir -p /app/staticfiles /app/media /app/logs && \
    chmod -R 755 /app/staticfiles /app/media /app/logs

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD sh -c "python manage.py migrate && daphne -b 0.0.0.0 -p $PORT project.asgi:application"
# cache bust 1781347105
# cache bust 1781347115
