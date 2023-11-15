FROM alpine:3.16
LABEL org.opencontainers.image.source=https://github.com/baobao1270/util-scripts/blob/master/docker/php-fpm
LABEL org.opencontainers.image.documentation=https://github.com/baobao1270/util-scripts/blob/master/docker/php-fpm/README.md
LABEL org.opencontainers.image.title="PHP-FPM"
LABEL org.opencontainers.image.description="PHP-FPM"
LABEL org.opencontainers.image.licenses=PHP-3.01
ENV  php=php8
ENV  fpm=php-fpm8
RUN  apk update && \
     apk add --no-cache $php-fpm $php-opcache icu-data-full \
         $php-bcmath $php-bz2 $php-calendar $php-ctype $php-curl $php-dba $php-dom \
         $php-enchant $php-exif $php-ffi $php-fileinfo $php-ftp $php-gd $php-gettext $php-gmp \
         $php-iconv $php-imap $php-intl $php-json $php-ldap $php-mbstring $php-openssl \
         $php-pcntl $php-posix $php-pspell $php-sysvmsg $php-sysvsem $php-sysvshm \
         $php-session $php-shmop $php-snmp $php-soap $php-sockets $php-sodium \
         $php-tidy $php-tokenizer $php-zip \
         $php-xml  $php-xmlreader $php-xmlwriter $php-xsl $php-simplexml \
         $php-mysqli $php-odbc $php-pgsql $php-sqlite3 \
         $php-pdo $php-pdo_dblib $php-pdo_mysql $php-pdo_odbc $php-pdo_pgsql $php-pdo_sqlite \
         $php-pecl-zstd $php-pecl-uuid $php-pecl-redis
COPY     container-init /container-init
CMD      /container-init
EXPOSE   9000
