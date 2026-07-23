FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY backend/requirements.txt /app/backend/
RUN pip install --upgrade pip && pip install -r requirements.txt gunicorn

COPY backend/ /app/backend/

RUN python manage.py collectstatic --noinput 2>/dev/null || true

CMD ["gunicorn", "eduSphere.wsgi:application", "--bind", "0.0.0.0:8000"]

