#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "▶ نصب پکیج‌ها..."
  npm install
fi

echo "▶ اجرای سرور..."
npm start
