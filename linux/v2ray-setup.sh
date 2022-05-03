#!/bin/bash
# v2ray-setup.sh v2.1
# CC-0 NO SIGNATURE NO WARRANTY

DOMAIN="example.com"
NAME="Example V2Ray"
ROOT_LOGIN="yes"
ADMIN_EMAIL="lty@example.com"
V2R_PATH=`uuidgen`
V2R_UUID=`uuidgen`
V2R_DEB="http://ftp.cn.debian.org/debian/pool/main/g/golang-v2ray-core/v2ray_4.34.0-1+b5_amd64.deb"

# install software
sudo apt update
sudo apt upgrade -y
sudo apt install -y ufw git unzip python-is-python3 curl wget nginx-full
sudo apt autoremove -y --purge snapd motd-news-config cloud-init
sudo apt list --upgradable

# kernel
echo "net.core.default_qdisc = fq"            >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control = bbr"  >> /etc/sysctl.conf
sysctl -p
lsmod | grep bbr

# ssh
ufw allow "OpenSSH"
yes | ufw enable
passwd -d root
sed -i "/^#HostKey/s/^#//g" /etc/ssh/sshd_config
sed -i "/^#ListenAddress 0.0.0.0/s/^#//g" /etc/ssh/sshd_config
sed -i "/^#PubkeyAuthentication yes/s/^#//g" /etc/ssh/sshd_config
sed -i "s/^#PasswordAuthentication yes$/PasswordAuthentication no/g" /etc/ssh/sshd_config
if [ "$ROOT_LOGIN" = "yes" ]; then
  sed -i "s/^#PermitRootLogin yes$/PermitRootLogin yes/g" /etc/ssh/sshd_config
else
  sed -i "s/^#PermitRootLogin yes$/PermitRootLogin no/g" /etc/ssh/sshd_config
fi
service ssh restart

# remove fucking services
rm -rf /root/snap
systemctl status motd-news.service
systemctl status motd-news.timer
systemctl stop motd-news.service
systemctl stop motd-news.timer
systemctl disable motd-news.service
systemctl disable motd-news.timer
rm -f /lib/systemd/system/motd-news.service
rm -f /lib/systemd/system/motd-news.timer
rm -f /etc/update-motd.d/50-motd-news

# acme.sh
CERT_ROOT=/etc/ssl/private
CERT_CA=$CERT_ROOT/v2ray-ca.pem
CERT_CHAIN=$CERT_ROOT/v2ray-fullchain.pem
CERT_KEY=$CERT_ROOT/v2ray-key.pem
ufw allow "Nginx Full"
curl  https://get.acme.sh | sh -s email=$ADMIN_EMAIL
source ~/.acme.sh/acme.sh.env
~/.acme.sh/acme.sh --issue -d $DOMAIN -w /var/www/html
~/.acme.sh/acme.sh --install-cert -d $DOMAIN --key-file $CERT_KEY --fullchain-file $CERT_CHAIN --ca-file $CERT_CA --reloadcmd "systemctl reload nginx"

# v2ray
curl "$V2R_DEB" -o /tmp/v2ray-install.deb
dpkg -i /tmp/v2ray-install.deb
rm -rf /tmp/v2ray-install.deb
rm -rf /etc/v2ray/config.json
cat > /etc/v2ray/config.json <<EOF
{
    "log": {
        "loglevel": "none"
    },
    "inbounds": [{
        "address": "127.0.0.1",
        "port": 1080,
        "protocol": "vmess",
        "settings": {
            "clients": [
                {"id": "<uuid>", "alterId": 64}
            ]
        },
        "streamSettings":{
            "network": "ws",
            "wsSettings": {
                "path": "/ws/<path>"
            }
        }
    }],
    "outbounds": [{
        "protocol": "freedom"
    }]
}
EOF
sed -i "s/<uuid>/$V2R_UUID/g" /etc/v2ray/config.json
sed -i "s/<path>/$V2R_PATH/g" /etc/v2ray/config.json
systemctl restart v2ray

# nginx
sed -i "s/# server_tokens off;/server_tokens off;/g" /etc/nginx/nginx.conf
sed -i "s/ssl_protocols.*$//g" /etc/nginx/nginx.conf
sed -i "s/ssl_prefer_server_ciphers.*$//g" /etc/nginx/nginx.conf
sed -i "s/# SSL Settings/# SSL Settings\n include \/etc\/nginx\/ssl-config;/g" /etc/nginx/nginx.conf
curl -s https://ssl-config.mozilla.org/ffdhe2048.txt > /etc/ssl/dhparam
cat > /etc/nginx/ssl-config <<EOF
ssl_certificate     $CERT_CHAIN;
ssl_certificate_key $CERT_KEY;
ssl_session_timeout 1d;
ssl_session_cache   shared:MozSSL:10m;
ssl_session_tickets off;
ssl_dhparam         /etc/ssl/dhparam;
ssl_protocols       TLSv1.2 TLSv1.3;
ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000" always;
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate $CERT_CA;
resolver 1.1.1.1;
EOF

mv /var/www/html/index.nginx-debian.html /var/www/html/index.html
rm -rf /etc/nginx/sites-available/default
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80 default_server;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl default_server;
    root /var/www/html;
    index index.html;

    server_name _;

    location / {
        try_files \$uri \$uri/ =403;
    }

    location /ws/$V2R_PATH {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:1080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$http_host;
    }
}
EOF
systemctl restart nginx

# return
echo -e "\033[32m Install Success! \033[0m" &&\
echo -e "\033[32m Port:     \033[46;34m 443 \033[0m" &&\
echo -e "\033[32m UserID:   \033[46;34m $V2R_UUID \033[0m" &&\
echo -e "\033[32m AlertID:  \033[46;34m 64 (0 if you are using newer server) \033[0m" &&\
echo -e "\033[32m Security: \033[46;34m auto \033[0m" &&\
echo -e "\033[32m Network:  \033[46;34m ws \033[0m" &&\
echo -e "\033[32m Type:     \033[46;34m none \033[0m" &&\
echo -e "\033[32m Path:     \033[46;34m /ws/$V2R_PATH \033[0m"
echo -e "\033[32m TLS:      \033[46;34m tls \033[0m"
V2R_VMESS_JSON=`echo {\"v\": \"2\", \"ps\": \"$NAME\", \"add\": \"$DOMAIN\", \"port\": \"443\", \"id\": \"$V2R_UUID\", \"aid\": \"64\", \"scy\": \"auto\", \"net\": \"ws\", \"type\": \"none\", \"host\": \"\", \"path\": \"/ws/$V2R_PATH\", \"tls\": \"tls\", \"sni\": \"\"}`
V2R_VMESS=`echo -n $V2R_VMESS_JSON | base64 -w 0`
echo -e "\033[32m VMess URL: \033[46;34m vmess://$V2R_VMESS \033[0m"
echo "vmess://$V2R_VMESS" > ~/vmess.txt
