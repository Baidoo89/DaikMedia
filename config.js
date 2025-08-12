// Daik Media Configuration File
// Replace these values with your actual Paystack API keys

const CONFIG = {
  // Paystack Configuration
  PAYSTACK: {
    PUBLIC_KEY: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your actual Paystack public key
    SECRET_KEY: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your actual Paystack secret key
    CURRENCY: 'GHS',
    COUNTRY: 'GH'
  },
  
  // Company Information
  COMPANY: {
    NAME: 'Daik Media',
    EMAIL: 'info@daikmedia.com',
    PHONE: '+233 557 574 477',
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
