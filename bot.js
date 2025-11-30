const { Telegraf, Markup, session } = require('telegraf');
const axios = require('axios');
const sharp = require('sharp');
const { createCanvas } = require('canvas');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const bot = new Telegraf(config.BOT_TOKEN);

// Middleware session
bot.use(session());

// States untuk conversation
bot.use((ctx, next) => {
  if (!ctx.session) {
    ctx.session = {
      state: null,
      data: {}
    };
  }
  return next();
});

// Fungsi untuk membuat menu utama
function createMainMenu(ctx) {
  const user = ctx.from;
  const userInfo = `
👤 User Info:
├ Username: @${user.username || 'Tidak ada'}
├ ID: ${user.id}
├ Nama: ${user.first_name} ${user.last_name || ''}
└ Bahasa: ${user.language_code || 'Tidak diketahui'}
  `;

  return Markup.keyboard([
    ['🎨 Buat Foto QC', '🖼️ Buat Stiker'],
    ['📱 Download TikTok', 'ℹ️ Bantuan']
  ]).resize();
}

// Command Start
bot.start(async (ctx) => {
  try {
    // Kirim foto dengan URL yang bisa diganti
    await ctx.replyWithPhoto(config.MENU_PHOTO_URL, {
      caption: `🤖 Selamat datang di Bot Multi-Fungsi!\n\n${getUserInfo(ctx.from)}\n\nPilih menu di bawah:`,
      reply_markup: createMainMenu(ctx).reply_markup
    });
  } catch (error) {
    // Jika foto gagal, kirim pesan teks saja
    await ctx.reply(
      `🤖 Selamat datang di Bot Multi-Fungsi!\n\n${getUserInfo(ctx.from)}\n\nPilih menu di bawah:`,
      createMainMenu(ctx)
    );
  }
});

// Fungsi untuk mendapatkan info user
function getUserInfo(user) {
  return `👤 User Info:
├ Username: @${user.username || 'Tidak ada'}
├ ID: \`${user.id}\`
├ Nama: ${user.first_name} ${user.last_name || ''}
└ Bahasa: ${user.language_code || 'Tidak diketahui'}`;
}

// Handler untuk Buat Foto QC
bot.hears('🎨 Buat Foto QC', (ctx) => {
  ctx.session.state = 'waiting_qc_text';
  ctx.reply('✍️ Masukkan teks untuk QR Code:\n\nContoh: "Hello World" atau "https://example.com"');
});

// Handler untuk Buat Stiker
bot.hears('🖼️ Buat Stiker', (ctx) => {
  ctx.session.state = 'waiting_sticker_photo';
  ctx.reply('📸 Kirimkan foto yang ingin dijadikan stiker:');
});

// Handler untuk Download TikTok
bot.hears('📱 Download TikTok', (ctx) => {
  ctx.session.state = 'waiting_tiktok_url';
  ctx.reply('🔗 Masukkan URL video TikTok:\n\nContoh: https://vt.tiktok.com/xxxxx/');
});

// Handler untuk Bantuan
bot.hears('ℹ️ Bantuan', (ctx) => {
  ctx.reply(`
🤖 BOT MULTI-FUNGSI

Fitur yang tersedia:
🎨 Buat Foto QC - Buat QR Code dari teks
🖼️ Buat Stiker - Convert foto menjadi stiker
📱 Download TikTok - Download video TikTok

Cara penggunaan:
1. Pilih menu yang diinginkan
2. Ikuti instruksi yang diberikan
3. Tunggu proses selesai

Bot dibuat dengan ❤️ menggunakan Node.js
  `);
});

// Handler untuk pesan teks (QC Text)
bot.on('text', async (ctx) => {
  const state = ctx.session.state;
  const text = ctx.message.text;

  if (state === 'waiting_qc_text') {
    try {
      await ctx.reply('⏳ Sedang membuat QR Code...');
      
      // Buat QR Code
      const qrCodeBuffer = await generateQRCode(text);
      
      // Buat gambar dengan background dan teks
      const finalImage = await createQCImage(qrCodeBuffer, text);
      
      // Kirim hasilnya
      await ctx.replyWithPhoto(
        { source: finalImage },
        { 
          caption: `✅ QR Code berhasil dibuat!\nTeks: "${text}"`,
          reply_markup: createMainMenu(ctx).reply_markup
        }
      );
      
      // Reset state
      ctx.session.state = null;
      
    } catch (error) {
      console.error('Error creating QC:', error);
      ctx.reply('❌ Gagal membuat QR Code. Silakan coba lagi.');
      ctx.session.state = null;
    }
  } else if (state === 'waiting_tiktok_url') {
    try {
      await ctx.reply('⏳ Sedang mendownload video TikTok...');
      
      const videoInfo = await downloadTikTok(text);
      
      if (videoInfo && videoInfo.videoUrl) {
        await ctx.replyWithVideo(
          videoInfo.videoUrl,
          {
            caption: `✅ Berhasil download video TikTok!\n\nJudul: ${videoInfo.title || 'Tidak ada judul'}`,
            reply_markup: createMainMenu(ctx).reply_markup
          }
        );
      } else {
        ctx.reply('❌ Gagal mendownload video. Pastikan URL valid.');
      }
      
      ctx.session.state = null;
    } catch (error) {
      console.error('Error downloading TikTok:', error);
      ctx.reply('❌ Gagal mendownload video TikTok. Silakan coba lagi dengan URL yang berbeda.');
      ctx.session.state = null;
    }
  }
});

// Handler untuk foto (Sticker)
bot.on('photo', async (ctx) => {
  if (ctx.session.state === 'waiting_sticker_photo') {
    try {
      await ctx.reply('⏳ Sedang membuat stiker...');
      
      // Dapatkan file ID foto dengan kualitas terbaik
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileUrl = await ctx.telegram.getFileLink(photo.file_id);
      
      // Download dan proses foto
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'arraybuffer'
      });
      
      // Proses gambar dengan sharp
      const processedImage = await sharp(response.data)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      
      // Buat stiker
      await ctx.replyWithSticker({ source: processedImage });
      await ctx.reply('✅ Stiker berhasil dibuat!', createMainMenu(ctx));
      
      ctx.session.state = null;
    } catch (error) {
      console.error('Error creating sticker:', error);
      ctx.reply('❌ Gagal membuat stiker. Silakan coba lagi dengan foto yang berbeda.');
      ctx.session.state = null;
    }
  }
});

// Fungsi untuk generate QR Code
async function generateQRCode(text) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convert Data URL ke Buffer
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

// Fungsi untuk membuat gambar QC dengan latar belakang dan teks
async function createQCImage(qrCodeBuffer, text) {
  const width = 800;
  const height = 900;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Tambahkan QR Code
  const qrImage = await sharp(qrCodeBuffer).toBuffer();
  const qrImg = await loadImage(qrImage);
  ctx.drawImage(qrImg, 200, 100, 400, 400);

  // Tambahkan teks judul
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QR CODE', width / 2, 60);

  // Tambahkan teks content
  ctx.font = '20px Arial';
  ctx.fillText('Teks:', width / 2, 550);
  
  // Potong teks jika terlalu panjang
  const displayText = text.length > 50 ? text.substring(0, 47) + '...' : text;
  ctx.font = '18px Arial';
  ctx.fillText(displayText, width / 2, 580);

  // Tambahkan footer
  ctx.font = '14px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('Dibuat oleh Telegram Bot', width / 2, height - 30);

  return canvas.toBuffer('image/png');
}

// Helper function untuk load image di canvas
function loadImage(buffer) {
  return new Promise((resolve, reject) => {
    const img = new (require('canvas').Image)();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = buffer;
  });
}

// Fungsi untuk download TikTok
async function downloadTikTok(url) {
  try {
    // Simple TikTok downloader menggunakan API public
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      return {
        title: data.title,
        videoUrl: data.play,
        duration: data.duration,
        author: data.author
      };
    }
    
    throw new Error('Invalid response from TikTok API');
  } catch (error) {
    console.error('TikTok download error:', error);
    throw error;
  }
}

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('❌ Terjadi kesalahan sistem. Silakan coba lagi nanti.');
});

// Start bot
console.log('🤖 Bot sedang berjalan...');
bot.launch().then(() => {
  console.log('✅ Bot berhasil dijalankan!');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));