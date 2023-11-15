# PHP-FPM
This is an unofficial [PHP-FPM](https://www.php.net) Docker image. The official one is too complicated to install plugins, so I made this with ALL PHP Extensions available on Alpine.

The image is based on [Alpine Linux](https://alpinelinux.org/).

## Base Image
The image is based on `alpine`. Multiple versions are used, based on the PHP version.

## Tags
 - `latest`: Latest version of PHP-FPM.
 - `8.2`: PHP 8.2, based on `alpine:3.18`.
 - `8.1`: PHP 8.1, based on `alpine:3.17`.
 - `8.0`: PHP 8.0, based on `alpine:3.16`.
 - `7.4`: PHP 7.4, based on `alpine:3.15`.

## Run this Image
You can pull this image from Docker Hub with command below:
```bash
docker pull josephcz/php-fpm
```

Then, run the image with command below:
```bash
docker run -d --name php-fpm \
    -v /path/to/wwwroot:/path/to/wwwroot \
    -p 127.0.0.1:9000:9000 \
    josephcz/php-fpm
```

## Configuration
### Environment Variables
This image uses environment variables below:
| Environment Variable | Default Value     | Description                      |
| -------------------- | ----------------- | -------------------------------- |
| `FPM_UID`            | Empty             | UID the PHP-FPM process runs as. |
| `FPM_GID`            | Same as `FPM_UID` | GID the PHP-FPM process runs as. |

If you want the PHP ***modify*** the content of your website, you **should** set the UID and GID to the same as the owner of your website folder. You can use `ls -an` to check the `UID` and `GID` of your website folder. Taken `/var/www/html` as an example:

```bash
ls -an /var/www/html

drwxr-xr-x  3  33  33 4096 Nov 13 09:04 .
drwxr-xr-x  3  33  33 4096 Nov 13 09:04 ..
```

That means the owner `UID` and `GID` of `/var/www/html` is `33` (which is `www-data` in Debian). So you should set `FPM_UID` and `FPM_GID` to `33`.

If you don't set the `FPM_GID` but set the `FPM_UID`, the container will set the `FPM_GID` to `FPM_UID` automatically.

If you don't set the `FPM_UID` ***AND*** `FPM_GID`, PHP-FPM will run as `nobody` user and group, which is ideal for ***read-only*** websites.

If you want to ***protect*** your website ***from being modified*** by PHP, you ***SHOULD NOT*** set the `FPM_UID` and `FPM_GID`.

### Volumes
This image uses volumes below:

| Host Path                  | Mount Point               | Description                 |
| -------------------------- | ------------------------- | --------------------------- |
| Your web content directory | Exactly same as host path | The web content directory.  |
| PHP Configuration          | `/etc/php/<php-version>`  | PHP configuration directory |

You ***MUST*** use the same path for both host and container. Otherwise, PHP-FPM will not work properly. For example, if your website is located at `/var/www/html`, you should mount the volume as `/var/www/html:/var/www/html`.

PHP configuration files can be overwritten by mounting the volume to `/etc/php/$php_version` where `$php_version` is the version of PHP without dot. Available versions are:
 - PHP 7.4: `/etc/php/php7`
 - PHP 8.0: `/etc/php/php8`
 - PHP 8.1: `/etc/php/php81`
 - PHP 8.2: `/etc/php/php82`

The available configuration to overwrite are:
 - `/etc/php/$php_version/php.ini`
 - `/etc/php/$php_version/php-fpm.conf`
 - `/etc/php/$php_version/php-fpm.d/www.conf`

If you choose to override the ***pool configuration***, you ***MUST*** use `www.conf` as the filename for the pool configuration, or the image will fallback to default `www.conf`.

The container will copy the configuration files to a temporary directory, make some adjustments on them to fix permission issues. So the actual configuration files might be different from the files you mounted. But your configuration files is left untouched.

## Exposed Ports
The image listens on ports below:
 - `8000/tcp`: PHP-FPM FastCGI

Binding the host port to `127.0.0.1:9000:9000` to prevent unwanted access from network is recommended.

## Docker Compose
Here is an example Docker Compose file:
```yaml
version: "3.9"

services:
  php-fpm:
    image: ghcr.io/baobao1270/php-fpm:8.0
    container_name: php-fpm
    restart: unless-stopped
    volumes:
      - /var/www/html:/var/www/html
    ports:
      - 127.0.0.1:9000:9000
    environment:
      - FPM_UID=33
```

## Build
Build this image with command below:
```bash
./docker-build <php-version>
```

## License
PHP is licensed under [PHP License](https://www.php.net/license/3_01.txt). The Dockerfile follows the same license.
