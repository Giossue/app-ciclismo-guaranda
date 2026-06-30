#!/usr/bin/env sh
set -eu

cd /var/www/html

if [ -z "${APP_KEY:-}" ]; then
    echo "ERROR: APP_KEY is missing. Set APP_KEY in Dokploy environment variables."
    exit 1
fi

mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

php artisan config:clear --no-interaction
php artisan view:clear --no-interaction
php artisan route:clear --no-interaction
php artisan storage:link --force --no-interaction || true

php artisan migrate --force --no-interaction

if [ "${RUN_SEEDERS:-true}" = "true" ]; then
    php artisan db:seed --force --no-interaction
fi

php artisan config:cache --no-interaction
php artisan view:cache --no-interaction

if ! php artisan route:cache --no-interaction; then
    echo "WARNING: route:cache failed. Continuing with uncached routes."
    php artisan route:clear --no-interaction
fi

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
