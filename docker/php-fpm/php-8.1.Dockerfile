FROM alpine:3.17
ENV  php=php81
ENV  fpm=php-fpm81
RUN  apk update && \
     apk add --no-cache $php-fpm $php-opcache icu-data-full \
         $php-bcmath $php-bz2 $php-calendar $php-ctype $php-curl $php-dba $php-dom \
         $php-enchant $php-exif $php-ffi $php-fileinfo $php-ftp $php-gd $php-gettext $php-gmp \
         $php-iconv $php-imap $php-intl $php-json $php-ldap $php-mbstring $php-openssl \
         $php-pcntl $php-posix $php-pspell $php-sysvmsg $php-sysvsem $php-sysvshm \
         $php-session $php-shmop $php-snmp $php-soap $php-sockets $php-sodium \
         $php-tidy $php-tokenizer $php-zip \
         $php-xml $php-xmlreader $php-xmlwriter $php-xsl $php-simplexml \
         $php-mysqli $php-odbc $php-pgsql $php-sqlite3 \
         $php-pdo $php-pdo_dblib $php-pdo_mysql $php-pdo_odbc $php-pdo_pgsql $php-pdo_sqlite \
         $php-pecl-zstd $php-pecl-uuid $php-pecl-redis
COPY     container-init /container-init
CMD      /container-init
EXPOSE   9000
