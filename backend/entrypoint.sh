#!/bin/sh
set -e

# Wait for PostgreSQL if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for PostgreSQL..."
    # Extract host and port from DATABASE_URL
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_PORT="${DB_PORT:-5432}"
    DB_HOST="${DB_HOST:-db}"

    until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
        echo "PostgreSQL ($DB_HOST:$DB_PORT) not ready yet..."
        sleep 1
    done
    echo "PostgreSQL is ready."
elif [ -n "$DATABASE_HOST" ]; then
    echo "Waiting for PostgreSQL..."
    DB_HOST="${DATABASE_HOST:-db}"
    DB_PORT="${DATABASE_PORT:-5432}"

    until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
        echo "PostgreSQL ($DB_HOST:$DB_PORT) not ready yet..."
        sleep 1
    done
    echo "PostgreSQL is ready."
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Execute the main command
exec "$@"
