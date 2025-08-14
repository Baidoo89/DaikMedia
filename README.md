# Daik Media - Data Package Sales Platform

A modern web application for selling mobile data packages in Ghana with integrated Paystack payment processing and wallet system.

## 🚀 Features

- **Wallet System**: Secure in-app wallet for managing funds
- **Data Packages**: MTN, Vodafone, and AirtelTigo packages
- **Paystack Integration**: Secure payment processing via cards, mobile money, and bank transfers
- **Real-time Updates**: Live wallet balance and transaction history
- **Responsive Design**: Mobile-first design for all devices
- **Telegram Notifications**: Automated order notifications
- **Google Sheets Integration**: Order data management

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Payment Gateway**: Paystack
- **Backend**: Node.js with Express
- **Data Storage**: Local Storage + Google Sheets
- **Notifications**: Telegram Bot API

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Paystack account
- Telegram Bot Token
- Google Apps Script (for sheets integration)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or using yarn
yarn install
```

### 2. Paystack Configuration

1. **Sign up** at [Paystack](https://paystack.com)
2. **Get your API keys** from the dashboard
3. **Update `config.js`** with your actual keys:

```javascript
const CONFIG = {
  PAYSTACK: {
    PUBLIC_KEY: 'pk_test_your_actual_public_key_here',
    SECRET_KEY: 'sk_test_your_actual_secret_key_here',
    CURRENCY: 'GHS',
    COUNTRY: 'GH'
  },
  // ... other config
};
```

### 3. Environment Variables (Optional)

Create a `.env` file for production:

```bash
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PORT=3000
NODE_ENV=production
```

### 4. Local Development

```bash
# Start development server
npm run dev

# Or start production server
npm start
```

Your app will be available at `http://localhost:3000`

## 🌐 Hosting Options

### Option 1: Heroku (Recommended for beginners)

1. **Install Heroku CLI**
2. **Deploy**:
```bash
heroku create your-app-name
git add .
git commit -m "Initial commit"
git push heroku main
```

3. **Set environment variables**:
```bash
heroku config:set PAYSTACK_SECRET_KEY=sk_live_your_key
```

### Option 2: Vercel

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Deploy**: `vercel --prod`

### Option 3: Netlify

1. **Connect your GitHub repository**
2. **Build command**: `npm install && npm start`
3. **Publish directory**: `.`

### Option 4: DigitalOcean/Railway

1. **Push to GitHub**
2. **Connect repository**
3. **Set environment variables**
4. **Deploy**

## 🔐 Security Considerations

- **Never expose** your Paystack secret key in frontend code
- **Use environment variables** for sensitive data
- **Verify webhook signatures** (already implemented)
- **HTTPS only** in production
- **Rate limiting** for payment endpoints

## 📱 Paystack Integration Details

### Supported Payment Methods

- **Credit/Debit Cards**: Visa, Mastercard, etc.
- **Mobile Money**: MTN, Vodafone, AirtelTigo
- **Bank Transfers**: Local Ghanaian banks

### Webhook Configuration

In your Paystack dashboard, set webhook URL to:
```
https://yourdomain.com/webhook/paystack
```

### Testing

Use Paystack test cards:
- **Card Number**: 4084 0840 8408 4081
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **PIN**: Any 4 digits

## 🚨 Troubleshooting

### Common Issues

1. **Payment not processing**:
   - Check Paystack API keys
   - Verify webhook URL
   - Check browser console for errors

2. **Server not starting**:
   - Ensure Node.js version is 14+
   - Check if port 3000 is available
   - Verify all dependencies are installed

3. **Paystack integration issues**:
   - Verify public key in config.js
   - Check Paystack dashboard for errors
   - Ensure webhook is properly configured

### Debug Mode

Enable debug logging in your browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 📞 Support

- **Email**: sendtonnimdee@gmail.com
- **Phone**: +233531257913
- **Telegram**: @DaikMediaBot

## 📄 License

This project is licensed under the MIT License.

## 🔄 Updates

Keep your dependencies updated:
```bash
npm update
npm audit fix
```

---

**Made with ❤️ by Daik Media**
