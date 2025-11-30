const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up Advanced Telegram Bot...');

// Check Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js version: ${nodeVersion}`);

// Install dependencies
console.log('📥 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.log('❌ Failed to install dependencies:', error.message);
}

// Create necessary directories
if (!fs.existsSync('temp')) {
  fs.mkdirSync('temp');
  console.log('✅ Created temp directory');
}

// Check if config exists, if not create from example
if (!fs.existsSync('config.js')) {
  const exampleConfig = `
module.exports = {
  BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
  MENU_PHOTO_URL: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  ADMIN_IDS: [123456789],
  // ... other config
};
  `;
  fs.writeFileSync('config.example.js', exampleConfig);
  console.log('⚠️  Please create config.js from config.example.js');
}

console.log('🎉 Setup completed!');
console.log('📝 Next steps:');
console.log('1. Edit config.js with your bot token');
console.log('2. Run: npm start');
console.log('3. Your bot will be ready!');
