FROM php:8.3-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libzip-dev libpng-dev \
    nodejs npm \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath zip gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files first for caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy package.json for npm
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Run composer scripts (post-autoload-dump etc)
RUN composer dump-autoload --optimize

# Build frontend assets
RUN npm run build

# Create storage directories
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Cache Laravel config/routes
RUN php artisan config:clear \
    && php artisan route:clear \
    && php artisan view:clear

# Expose port
EXPOSE ${PORT:-8080}

# Start Laravel
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
