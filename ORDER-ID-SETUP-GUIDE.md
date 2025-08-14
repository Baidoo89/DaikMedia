# 🆔 Order ID System Setup Guide - Daik Media

## 📋 Overview
This guide will help you set up an automatic sequential Order ID system for your Daik Media website. The system will:

1. **Generate Unique IDs** - Automatically create sequential Order IDs (001, 002, 003, etc.)
2. **Google Sheets Integration** - Order ID saved in "Order ID" column
3. **Telegram Notifications** - Order ID displayed prominently at the top
4. **No Duplicate IDs** - System automatically increments
5. **Customer Confirmation** - Order ID shown in success message

## 🛠️ Setup Instructions

### **Step 1: Google Sheets Setup**

1. **Create a new Google Sheet** or use an existing one
2. **Name the first sheet** "Orders" (exactly as shown)
3. **Set up the header row** with these columns in order:
   ```
   A: Date and Time | B: Order ID | C: Number | D: Bundle Amount | E: Network | F: Payment | G: Status
   ```
4. **Copy your Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
   ```

### **Step 2: Google Apps Script Setup**

1. **Go to [script.google.com](https://script.google.com)**
2. **Create a new project** named "Daik Media Order System"
3. **Replace the default code** with the content from `google-apps-script-updated.js`
4. **Replace all instances** of `'YOUR_SPREADSHEET_ID_HERE'` with your actual spreadsheet ID
5. **Save the project** (Ctrl+S or Cmd+S)
6. **Deploy as web app**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app"
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
7. **Copy the Web App URL** (you'll need this for the next step)

### **Step 3: Update Configuration**

1. **Open `config.js`** in your project
2. **Replace the SCRIPT_URL** with your Google Apps Script web app URL:
   ```javascript
   GOOGLE_SHEETS: {
     SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
   }
   ```

### **Step 4: Test the System**

1. **Upload your updated files** to your hosting platform
2. **Test the order flow**:
   - Load money to wallet
   - Place a test order
   - Verify Order ID appears in confirmation
   - Check Google Sheets for the new entry
   - Verify Telegram notification includes Order ID

## 🔧 How It Works

### **Order Flow:**
1. **User submits order** → Website calls `generateOrderID()`
2. **Google Apps Script** → Returns next sequential ID (001, 002, 003...)
3. **Order processed** → Order ID included in all communications
4. **Data saved** → Order ID stored in Google Sheets
5. **Customer notified** → Order ID displayed in success message

### **Order ID Format:**
- **Format**: 3-digit sequential numbers (001, 002, 003...)
- **Auto-increment**: Each new order gets the next available number
- **No duplicates**: System ensures unique IDs
- **Fallback**: If system fails, generates timestamp-based ID

## 📱 Customer Experience

### **What Customers See:**
1. **Order Confirmation** - After placing an order, customers see their Order ID prominently displayed
2. **Order ID in Message** - Clear display: "🆔 **Order ID: 001**"
3. **Instructions** - "Save this Order ID for tracking your order status later!"

### **Success Message Example:**
```
Order Placed Successfully! 🎉

Your 5GB order for MTN has been placed and will be processed shortly.

🆔 **Order ID: 001**
💰 Amount: GH₵27.00 (deducted from wallet)

📱 **Save this Order ID for tracking your order status later!**

You will receive updates via SMS/WhatsApp when your order is processed.
```

## 📊 Google Sheets Structure

### **Required Columns:**
| Column | Header | Data Type | Example |
|--------|--------|-----------|---------|
| A | Date and Time | DateTime | 2024-12-19T14:30:45.123Z |
| B | Order ID | Text | 001, 002, 003... |
| C | Number | Text | 233244123456 |
| D | Bundle Amount | Text | 5GB - GH₵27 |
| E | Network | Text | MTN, Vodafone, AirtelTigo |
| F | Payment | Text | Wallet, Card, Bank Transfer |
| G | Status | Text | Pending, Processing, Completed |

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Script URL not found"**
   - Verify your Google Apps Script is deployed as a web app
   - Check the URL in `config.js`

2. **"Sheet not found"**
   - Ensure your Google Sheet has a sheet named exactly "Orders"
   - Check the spreadsheet ID in the Google Apps Script

3. **Order IDs not incrementing**
   - Verify the Google Apps Script has proper permissions
   - Check the browser console for errors

4. **Fallback IDs appearing**
   - Check your Google Apps Script deployment
   - Verify the spreadsheet ID is correct
   - Check for any JavaScript errors

### **Testing Commands:**
- **Test Order ID Generation**: Visit `YOUR_SCRIPT_URL?action=getNextOrderID`
- **Test Order Saving**: Submit a test order through your website
- **Check Google Sheets**: Verify new entries appear with correct Order IDs

## 🔒 Security Notes

- **Google Apps Script** runs on Google's secure servers
- **No sensitive data** is stored in the script itself
- **Access control** is managed through Google's authentication
- **Web app deployment** can be restricted to specific users if needed

## 📞 Support

If you encounter issues:
1. **Check browser console** for JavaScript errors
2. **Verify Google Apps Script** deployment and permissions
3. **Test the script URL** directly in your browser
4. **Check Google Sheets** for proper structure and permissions

---

**⚠️ Important**: Always test with a small amount first before processing real orders!
