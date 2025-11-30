#!/bin/bash
echo "🤖 Setup Telegram Multi-Function Bot"

# Update package list
pkg update && pkg upgrade -y

# Install Node.js jika belum ada
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    pkg install nodejs -y
fi

# Install ffmpeg untuk processing video
echo "📦 Installing FFmpeg..."
pkg install ffmpeg -y

# Install dependencies Python untuk canvas
echo "📦 Installing Python and build tools..."
pkg install python -y
pkg install build-essential -y

# Buat directory project
mkdir telegram-bot
cd telegram-bot

# Copy file-file yang diperlukan
# (Anda perlu menyalin file JavaScript yang sudah dibuat)

# Install dependencies npm
echo "📦 Installing npm dependencies..."
npm install

echo "✅ Setup selesai!"
echo "📝 Jangan lupa ganti BOT_TOKEN di config.js"
echo "🚀 Jalankan bot dengan: npm start"