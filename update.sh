#!/bin/bash
cd /var/www/zdravinfa
git pull origin main
npm install --production=false
npm run build
pm2 restart zdravinfa
echo "✅ Сайт обновлён!"
