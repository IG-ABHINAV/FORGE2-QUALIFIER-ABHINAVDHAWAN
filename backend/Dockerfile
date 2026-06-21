FROM richarvey/nginx-php-fpm:3.1.6

# Set working directory
WORKDIR /var/www/html

# Copy all files
COPY . .

# Copy environment file
RUN cp .env.example .env

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Generate APP_KEY
RUN php artisan key:generate

# Create SQLite database and run migrations during build
RUN touch database/database.sqlite && \
    php artisan migrate --force

# Set permissions for storage, cache, and database
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Image config
ENV SKIP_COMPOSER 1
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# Laravel config
ENV APP_ENV production
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

# Allow composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER 1

CMD ["/start.sh"]
