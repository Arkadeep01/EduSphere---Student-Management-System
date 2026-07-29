FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY backend/requirements.txt /app/backend/
RUN pip install --upgrade pip && pip install -r requirements.txt daphne

COPY backend/ /app/backend/

RUN python manage.py collectstatic --noinput 2>/dev/null || true

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "eduSphere.asgi:application"]

