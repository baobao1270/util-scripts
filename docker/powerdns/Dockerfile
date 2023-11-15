FROM debian:11-slim
LABEL org.opencontainers.image.source=https://github.com/baobao1270/util-scripts/blob/master/docker/powerdns
LABEL org.opencontainers.image.documentation=https://github.com/baobao1270/util-scripts/blob/master/docker/powerdns/README.md
LABEL org.opencontainers.image.title="PowerDNS Authoritative Server MySQL Backend"
LABEL org.opencontainers.image.description="PowerDNS Authoritative Server MySQL Backend"
LABEL org.opencontainers.image.licenses=GPL-2.0
RUN apt update && apt install -y curl dnsutils pdns-server pdns-backend-mysql && \
	mkdir -p /config && cp -v /etc/powerdns/pdns.conf /config
EXPOSE 53/udp 53/tcp 80/tcp
CMD ["pdns_server", "--config-dir=/config"]
