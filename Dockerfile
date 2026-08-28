FROM php:8.4-fpm-bookworm

WORKDIR /var/www/html

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    APP_ENV=production \
    PHP_OPCACHE_ENABLE=1

ARG PHP_BUILD_JOBS=2
ARG REDIS_EXTENSION_VERSION=6.3.0

RUN apt-get -o Acquire::Retries=3 update \
    && apt-get -o Acquire::Retries=3 install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        gnupg \
        nginx \
        supervisor \
        unzip \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libpq-dev \
        libzip-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl --fail --silent --show-error --location \
        --retry 5 --retry-delay 2 --retry-all-errors \
        https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get -o Acquire::Retries=3 install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"${PHP_BUILD_JOBS}" \
        bcmath \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_pgsql \
        pgsql \
        zip \
    && pecl install "redis-${REDIS_EXTENSION_VERSION}" \
    && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN { \
        echo 'opcache.enable=${PHP_OPCACHE_ENABLE}'; \
        echo 'opcache.enable_cli=1'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'opcache.max_accelerated_files=20000'; \
        echo 'opcache.memory_consumption=256'; \
    } > /usr/local/etc/php/conf.d/opcache.ini \
    && { \
        echo 'upload_max_filesize = 25M'; \
        echo 'post_max_size = 90M'; \
        echo 'max_file_uploads = 25'; \
        echo 'memory_limit = 256M'; \
    } > /usr/local/etc/php/conf.d/uploads.ini \
    && { \
        echo 'clear_env = no'; \
        echo 'catch_workers_output = yes'; \
    } >> /usr/local/etc/php-fpm.d/www.conf

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi \
    && npm run build:ssr \
    && npm prune --omit=dev \
    && mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY docker/start-nginx.sh /usr/local/bin/start-nginx.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/start-nginx.sh

EXPOSE 80

HEALTHCHECK --interval=10s --start-interval=2s --timeout=3s --start-period=30s --retries=5 \
    CMD curl --fail --silent --show-error http://127.0.0.1/up > /dev/null || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
