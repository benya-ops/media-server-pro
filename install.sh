#!/bin/bash
set -e
echo "Media Server Pro - Install"
if [ "$EUID" -ne 0 ]; then echo "Run with sudo"; exit 1; fi
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
fi
read -p "Domain or IP: " DOMAIN
read -p "DB Password: " PASS
echo "DOMAIN=$DOMAIN" > .env
echo "POSTGRES_PASSWORD=$PASS" >> .env
docker-compose build
docker-compose up -d
echo "Done! UI: http://$DOMAIN:3000"
