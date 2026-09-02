#!/usr/bin/env bash
# ============================================================
#  聚好玩 · 服务器一键部署脚本（在服务器上执行）
#  前置：代码已传到 /opt/party-games（git clone 或 rsync）
#  用法：sudo bash setup-server.sh 你的主域名
#        例：sudo bash setup-server.sh example.cloud
#  说明：脚本会装依赖(幂等)→ 构建前后端 → 部署静态 → 写 nginx → pm2 启动
#  注意：证书路径默认用 certbot（/etc/letsencrypt/live/主域/）。
#        若你用腾讯云免费证书，请先手动改 deploy/nginx.conf 里的
#        ssl_certificate / ssl_certificate_key 两行再跑本脚本。
# ============================================================
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "用法: sudo bash setup-server.sh 你的主域名(如 example.cloud)"
  exit 1
fi

APP_DIR="/opt/party-games"
WEB_DIR="$APP_DIR/packages/web"
SERVER_DIR="$APP_DIR/packages/server"

echo "==> [1/6] 安装系统依赖（若缺失）"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
command -v nginx  >/dev/null 2>&1 || apt-get install -y nginx
command -v pm2    >/dev/null 2>&1 || npm i -g pm2
# 仅当 nginx.conf 指向的证书不存在时才安装/签发 certbot，避免覆盖你已配好的证书
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
if [ ! -f "$CERT_PATH" ]; then
  echo "    (未检测到 certbot 证书 $CERT_PATH，安装 certbot 备用)"
  command -v certbot>/dev/null 2>&1 || apt-get install -y certbot python3-certbot-nginx
fi

echo "==> [2/6] 安装 npm 依赖并构建前后端"
cd "$APP_DIR"
npm install
npm -w @pg/web run build
npm -w @pg/server run build

echo "==> [3/6] 部署静态产物"
mkdir -p /var/www/party/dist /var/www/portfolio /var/log/party-games
cp -r "$WEB_DIR/dist/." /var/www/party/dist/
cp -r "$APP_DIR/portfolio/." /var/www/portfolio/

echo "==> [4/6] 写 nginx 配置（YOUR_DOMAIN -> $DOMAIN）"
sed "s/YOUR_DOMAIN/$DOMAIN/g" "$SERVER_DIR/deploy/nginx.conf" > /etc/nginx/sites-available/party-games.conf
ln -sf /etc/nginx/sites-available/party-games.conf /etc/nginx/sites-enabled/party-games.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx 2>/dev/null || true
systemctl restart nginx

echo "==> [5/6] 启动 Node 服务（pm2 守护 + 开机自启）"
cd "$SERVER_DIR"
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -3 || true

echo "==> [6/6] 完成 ✅"
echo "  游戏站 : https://party.$DOMAIN"
echo "  作品集 : https://works.$DOMAIN"
echo "  健康检查: curl -s http://127.0.0.1:3000/api/health"
