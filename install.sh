#!/usr/bin/env bash
set -e
echo "Installing server..."
(cd server && npm install)
echo "Installing web..."
(cd web && npm install)
echo "Installing mobile... (this may take a while)"
(cd mobile && npm install)
echo "Done. Start server: cd server && npm run dev"
echo "Start web: cd web && npm run dev"
echo "Start mobile: cd mobile && npx expo start"
