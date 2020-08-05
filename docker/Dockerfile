# #############################################################################
# Webserver
# #############################################################################
FROM php:7.4-apache as webserver

RUN a2enmod rewrite && \
    sed -i "s/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/public/" /etc/apache2/sites-enabled/000-default.conf

RUN pecl install redis \
    && docker-php-ext-enable redis

WORKDIR /var/www

# #############################################################################
# Node Container
# #############################################################################
FROM node:12 as node

WORKDIR /opt/app/frontend