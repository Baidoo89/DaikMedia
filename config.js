// Daik Media Configuration File
// Public configuration - No sensitive data

const CONFIG = {
  // Company Information
  COMPANY: {
    NAME: 'Daik Media',
    EMAIL: 'sendtonnimdee@gmail.com',
    PHONE: '+233531257913',
    WEBSITE: 'https://daikmedia.com'
  },
  
  // Google Sheets Configuration (Public URL only)
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
