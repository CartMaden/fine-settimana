# Partiamo dall'immagine ufficiale PHP con Apache
FROM php:8.2-apache

# Installiamo le estensioni PHP necessarie per MySQL (PDO e mysqli)
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Abilitiamo mod_rewrite di Apache (utile per URL puliti)
RUN a2enmod rewrite
