// Daik Media Configuration File
// Replace these values with your actual Paystack API keys

const CONFIG = {
  // Paystack Configuration
  PAYSTACK: {
    PUBLIC_KEY: 'pk_live_e6b3d2f2d1e0efa6c8d8675c6c555cb0576b2e33', // Replace with your actual Paystack public key
    SECRET_KEY: 'sk_live_3b8edbaf7e6a64510665870a9b7fcb8ec2521d93', // Replace with your actual Paystack secret key
    CURRENCY: 'GHS',
    COUNTRY: 'GH'
  },
  
  // Company Information
  COMPANY: {
    NAME: 'Desmond Amponsah',
    EMAIL: 'sendtonnimdee@gmail.com',
    PHONE: '+233 531 257 913',
    WEBSITE: 'https://daikmedia.com'
  },
  
  // Telegram Bot Configuration
  TELEGRAM: {
    BOT_TOKEN: '8427904139:AAGo8Io1YmTGz7SIQxd0Emam9rEU__iR1SM',
    CHAT_ID: '7271153158'
  },
  
  // Google Sheets Configuration
  GOOGLE_SHEETS: {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzuFDTosabmYvMFlZxSyvp-LmRR09eKFiEUDWA1WlEP5cCPgPoTh82vG4vmsjBb9RypeQ/exec'
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}


