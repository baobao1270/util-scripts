#!/bin/bash
mkdir -p /usr/local/bin /usr/local/etc/coredns /var/lib/coredns
ln -s /usr/local/etc/coredns /etc/coredns
curl -L https://github.com/coredns/coredns/releases/download/v1.9.3/coredns_1.9.3_linux_amd64.tgz | tar -xzC /usr/local/bin
curl -L https://raw.githubusercontent.com/coredns/deployment/master/systemd/coredns.service \
     | sed "s/\/usr\/bin\/coredns/\/usr\/local\/bin\/coredns/" \
     | sed "s/\/etc\/coredns/\/usr\/local\/etc\/coredns/" > /etc/systemd/system/coredns.service
curl -L https://raw.githubusercontent.com/coredns/deployment/master/systemd/coredns-sysusers.conf > /usr/lib/sysusers.d/coredns-sysusers.conf
curl -L https://raw.githubusercontent.com/coredns/deployment/master/systemd/coredns-tmpfiles.conf > /usr/lib/tmpfiles.d/coredns-tmpfiles.conf
curl -L https://raw.githubusercontent.com/coredns/deployment/master/debian/Corefile > /etc/coredns/Corefile

