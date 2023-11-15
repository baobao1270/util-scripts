# PowerDNS Authoritative Server MySQL Backend
This is an unofficial Docker image for [PowerDNS](https://www.powerdns.com/). It creates a easily usable PowerDNS server with a MySQL backend.

## Base Image
The image is based on `debian:11-slim`.

## Tags
 - `latest`: Latest version and latest build.
 - `<version>-build<build-date>`: Specific version of PowerDNS, shipped from Debian, with build date. For example, `4.4.1.1-build20230101`. See *Tags* tab for all available tags.

## Run this Image
You can pull this image from Docker Hub with command below:
```bash
docker pull josephcz/powerdns
```

Then, run the image with command below:
```bash
docker run -d --name powerdns \
    -p 53:53/udp \
    -p 53:53/tcp \
    -p 127.0.0.1:8000:80 \
    -v /etc/pdns.conf:/config/pdns.conf:ro \
    josephcz/powerdns
```

## Configuration
### Environment Variables
This image does not use any environment variables.

### Volumes
This image uses volumes below:

| Host Path                     | Mount Point         | Description                 |
|-------------------------------|---------------------|-----------------------------|
| Your `powerdns` configuration | `/config/pdns.conf` | PowerDNS configuration file |

## Exposed Ports
The image listens on ports below:
 - `53/udp`: DNS Service
 - `53/tcp`: DNS Service
 - `80/tcp`: PowerDNS Web API

### Configuration File
The configuration file should be mounted to `/config/pdns.conf`. Here is an example PowerDNS configuration file:
```conf
webserver=yes
webserver-port=80
webserver-address=0.0.0.0
webserver-allow-from=127.0.0.1,10.0.0.0/24
api=yes
api-key=YOUR-SECRET-API-KEY

launch=gmysql
gmysql-host=host
gmysql-dbname=powerdns
gmysql-user=powerdns
gmysql-password=YOUR-DATABASE-PASSWORD
gmysql-dnssec=yes

default-soa-edit=INCEPTION-INCREMENT
default-soa-edit-signed=INCEPTION-INCREMENT

allow-axfr-ips=127.0.0.1,10.0.0.0/24
also-notify=10.0.0.54,10.0.0.55
only-notify=10.0.0.0/24
master=yes
```

This is a tipical _Hidden Main Server_ authoritative server configuration. PowerDNS runs as main server, and two DNS server, `10.0.0.54` and `10.0.0.55` runs as authoritative servers that exposed to users. The configuration also exposes API on port `80`.

## Docker Compose
Here is an example Docker Compose file:
```yaml
version: '3.8'

networks:
  powerdns:
    name: powerdns
    driver_opts:
      com.docker.network.bridge.name: dockernet0
    ipam:
      config:
        - subnet: 192.168.18.0/24

services:
  powerdns:
    image: josephcz/powerdns:latest
    container_name: powerdns
    restart: always
    networks:
      powerdns:
        ipv4_address: 192.168.18.1
    ports:
      - 53:53/udp
      - 53:53/tcp
      - 127.0.0.1:8000:80
    volumes:
      - /srv/conf/pdns.conf:/config/pdns.conf:ro
    healthcheck:
      test: ["CMD", "curl", "-sfvo", "/dev/null", "localhost"]
      retries: 3
      timeout: 30s
      interval: 30s
      start_period: 15s
    deploy:
      resources:
        limits:
          memory: 768M
```

## Build
Build this image with command below:
```bash
docker build -t powerdns .
```

## License
The PowerDNS is licensed under [GNU General Public License v2.0](https://github.com/PowerDNS/pdns/blob/master/COPYING). The Dockerfile follows the same license.
