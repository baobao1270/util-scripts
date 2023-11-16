FROM debian:11-slim
RUN apt update && apt install -y curl dnsutils pdns-server pdns-backend-mysql && \
	mkdir -p /config && cp -v /etc/powerdns/pdns.conf /config
EXPOSE 53/udp 53/tcp 80/tcp
CMD ["pdns_server", "--config-dir=/config"]
