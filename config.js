module.exports = {
  // Ganti dengan token bot Anda dari @BotFather
  BOT_TOKEN: '7895665338:AAHGG6X3pDkXMPvMzntOLX0-MeRYjez8xuc',
  
  // URL foto yang akan ditampilkan di menu (bisa diganti)
  MENU_PHOTO_URL: 'https://azra-c.vercel.app',
  
  // Konfigurasi QC
  QC_CONFIG: {
    width: 800,
    height: 900,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 24,
    styles: {
      modern: { primary: '#667eea', secondary: '#764ba2' },
      classic: { primary: '#2c3e50', secondary: '#34495e' },
      neon: { primary: '#00ff88', secondary: '#00ccff' }
    }
  },
  
  // Konfigurasi Sticker
  STICKER_CONFIG: {
    maxSize: 512,
    quality: 90
  },
  
  // API untuk download TikTok (multiple sources)
  TIKTOK_APIS: [
    'https://api.tiklydown.eu.org/api/download?url=',
    'https://www.tikwm.com/api/?url=',
    'https://api.tiktokv.com/aweme/v1/aweme/detail/'
  ],
  
  // Fitur tambahan
  FEATURES: {
    youtube_downloader: true,
    weather_info: true,
    currency_converter: true,
    text_analysis: true
  },
  
  // Admin settings
  ADMIN_IDS: [123456789], // Ganti dengan ID admin Anda
  MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
};
