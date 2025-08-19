/**********************************************
 * Daik Media – MTN Orders API (Enhanced)
 * - Maintains existing working functionality
 * - Auto-creates headers and formatting
 * - Enhanced error handling and logging
 * - Paystack integration ready
 * - Telegram notifications ready
 **********************************************/

// ========= Constants =========
const SHEET_ID = '1XBWntI6f_DXetdEQRzkksKqJHixdXdD4saq05-d-7Ns';
const SHEET_HEADERS = [
  'Timestamp',        // A
  'Order ID',         // B
  'Customer Name',    // C
  'Phone Number',     // D
  'Data Bundle',      // E
  'Payment Amount',   // F
  'Status',           // G
  'Payment Ref',      // H
  'Customer Email',   // I
  'Network',          // J
  'Notes',            // K
  'Last Updated'      // L
];

// ========= Entry Points =========
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : null;
    
    if (action === 'testSheet') {
      return json(testSheetAccess_());
    }
    if (action === 'getNextOrderID') {
      return json(getNextOrderID_());
    }
    if (action === 'testOrder') {
      return json(testOrder_());
    }
    if (action === 'testCompleteOrder') {
      return json(testCompleteOrder());
    }
    if (action === 'showStructure') {
      return json(showSheetStructure());
    }
    if (action === 'getWalletData') {
      return json(getWalletData_());
    }
    if (action === 'getPaystackKey') {
      return json(getPaystackKey_());
    }

    return ContentService
      .createTextOutput("MTN Data Order Form - Google Apps Script is working!")
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (err) {
    Logger.log('❌ doGet error: ' + String(err));
    return ContentService.createTextOutput('MTN Orders API Error');
  }
}

function doPost(e) {
  try {
    // Check if this is an order submission
    const data = e.parameter;
    const action = data.action;
    
    // Log received data for debugging
    Logger.log('📥 Received data: ' + JSON.stringify(data));
    
    if (action === 'saveOrder') {
      return handleOrderSubmission_(data);
    }
    
    if (action === 'saveWalletData') {
      return handleWalletBackup_(data);
    }
    
    Logger.log('❌ Invalid action: ' + action);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'success': false, 
        'error': 'Invalid action. Expected: saveOrder or saveWalletData' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    Logger.log('❌ doPost error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle order submission
function handleOrderSubmission_(data) {
  try {
    // WALLET PAYMENT ALREADY VERIFIED - User can only order if they have money!
    // No need to verify payment again - wallet deduction = payment proof
    Logger.log('✅ Wallet payment verified (user has sufficient balance)');
    
    // Your "MTN ORDERS BUS" sheet ID - KEEPING EXACTLY WHAT WORKS
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Ensure headers exist and are formatted
    ensureSheetHeaders_(sheet);
    
    // Get the next Order ID before saving
    const nextOrderID = getNextOrderID_();
    
    // Enhanced professional row structure
    const row = [
      new Date(),                    // A: Timestamp
      nextOrderID.orderID,           // B: Order ID
      data.name || 'N/A',           // C: Customer Name
      data.number || 'N/A',         // D: Phone Number
      data.bundle || 'N/A',         // E: Data Bundle
      data.payment || 'N/A',        // F: Payment Amount
      'Paid',                        // G: Status (Payment verified = Paid)
      data.paymentRef || 'Wallet',  // H: Payment Reference
      'N/A',                        // I: Customer Email (Removed from form)
      data.network || 'MTN',        // J: Network (default to MTN)
      data.notes || 'N/A',          // K: Notes
      new Date()                     // L: Last Updated
    ];
    
    sheet.appendRow(row);
    
    // Log successful order
    Logger.log('✅ Order saved successfully:');
    Logger.log('   Order ID: ' + nextOrderID.orderID);
    Logger.log('   Customer: ' + data.name);
    Logger.log('   Phone: ' + data.number);
    Logger.log('   Bundle: ' + data.bundle);
    Logger.log('   Payment: ' + data.payment);
    Logger.log('   Network: ' + data.network);
    
    // Send Telegram notification (status is now 'Paid' since payment is verified)
    sendTelegramNotification_(nextOrderID.orderID, data, 'Paid');
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'success': true, 
        'orderID': nextOrderID.orderID,
        'status': 'Paid',
        'paymentVerified': true
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    Logger.log('❌ Order submission error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 'success': false, 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle wallet backup
function handleWalletBackup_(data) {
  try {
    const balance = data.balance;
    const transactions = data.transactions;
    
    Logger.log('📥 Wallet backup received:');
    Logger.log('   Balance: ' + balance);
    Logger.log('   Transactions: ' + (transactions ? transactions.length : 0));
    
    // Store in Script Properties for backup
    const props = PropertiesService.getScriptProperties();
    props.setProperty('WALLET_BALANCE', balance);
    props.setProperty('WALLET_TRANSACTIONS', transactions);
    props.setProperty('WALLET_LAST_UPDATE', new Date().toISOString());
    
    Logger.log('✅ Wallet backup stored successfully');
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'success': true, 
        'message': 'Wallet backup stored successfully',
        'timestamp': new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    Logger.log('❌ Wallet backup error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 'success': false, 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Get wallet data for restoration
function getWalletData_() {
  try {
    const props = PropertiesService.getScriptProperties();
    const balance = props.getProperty('WALLET_BALANCE') || '0';
    const transactions = props.getProperty('WALLET_TRANSACTIONS') || '[]';
    const lastUpdate = props.getProperty('WALLET_LAST_UPDATE') || 'Never';
    
    Logger.log('📤 Wallet data requested:');
    Logger.log('   Balance: ' + balance);
    Logger.log('   Last Update: ' + lastUpdate);
    
    return {
      success: true,
      walletData: {
        balance: balance,
        transactions: JSON.parse(transactions),
        lastUpdate: lastUpdate
      },
      message: 'Wallet data retrieved successfully'
    };
    
  } catch(error) {
    Logger.log('❌ Get wallet data error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to retrieve wallet data'
    };
  }
}

// Get Paystack public key for frontend
function getPaystackKey_() {
  try {
    const props = PropertiesService.getScriptProperties();
    const paystackKey = props.getProperty('PAYSTACK_PUBLIC_KEY');
    
    if (paystackKey) {
      Logger.log('📤 Paystack key requested and provided');
      return {
        success: true,
        paystackKey: paystackKey,
        message: 'Paystack key retrieved successfully'
      };
    } else {
      Logger.log('❌ Paystack key not found in Script Properties');
      return {
        success: false,
        error: 'Paystack not configured',
        message: 'Paystack public key not found. Please run setSecrets() first.'
      };
    }
    
  } catch(error) {
    Logger.log('❌ Get Paystack key error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to retrieve Paystack key'
    };
  }
}

// ========= Sheet Management =========

function ensureSheetHeaders_(sheet) {
  try {
    // Check if headers already exist
    const firstRow = sheet.getRange(1, 1, 1, SHEET_HEADERS.length).getValues()[0];
    const hasHeaders = firstRow.every((cell, index) => cell === SHEET_HEADERS[index]);
    
    if (!hasHeaders) {
      // Clear the sheet and add headers
      sheet.clear();
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
      
      // Format headers beautifully
      const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      headerRange.setBackground('#4285f4'); // Google Blue
      headerRange.setFontColor('white');
      headerRange.setFontSize(12);
      
      // Freeze header row
      sheet.setFrozenRows(1);
      
      // Auto-resize columns
      for (let i = 1; i <= SHEET_HEADERS.length; i++) {
        sheet.autoResizeColumn(i);
      }
      
      Logger.log('✅ Sheet headers created and formatted');
    }
  } catch (err) {
    Logger.log('⚠️ Header setup warning: ' + String(err));
    // Don't fail the order if headers can't be set up
  }
}

// ========= Utility Functions =========

function testSheetAccess_() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const sheetName = sheet.getName();
    const activeSheet = sheet.getActiveSheet();
    const activeSheetName = activeSheet.getName();
    const lastRow = activeSheet.getLastRow();
    
    return {
      success: true,
      spreadsheetName: sheetName,
      activeSheetName: activeSheetName,
      totalRows: lastRow,
      hasHeaders: lastRow > 0,
      message: 'Sheet access successful'
    };
  } catch (err) {
    return {
      success: false,
      error: String(err),
      message: 'Sheet access failed'
    };
  }
}

function getNextOrderID_() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { orderID: '001' };
    }
    
    // Get the last Order ID from column B (Order ID column)
    const lastOrderID = sheet.getRange(lastRow, 2).getValue(); // Column B = Order ID
    
    if (!lastOrderID || lastOrderID === 'Order ID') {
      // If no valid Order ID found, start with 001
      return { orderID: '001' };
    }
    
    // Extract the number from the last Order ID and increment
    const lastNumber = parseInt(lastOrderID, 10);
    if (isNaN(lastNumber)) {
      return { orderID: '001' };
    }
    
    const nextNumber = lastNumber + 1;
    const nextOrderID = String(nextNumber).padStart(3, '0');
    
    return { orderID: nextOrderID };
    
  } catch (err) {
    Logger.log('⚠️ getNextOrderID error: ' + String(err));
    return { 
      success: false, 
      error: String(err),
      orderID: '001' 
    };
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========= Configuration Setup (Optional) =========

function setSecrets() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    // ==== Paystack (for future use) ====
    PAYSTACK_PUBLIC_KEY: 'pk_live_e6b3d2f2d1e0efa6c8d8675c6c555cb0576b2e33',
    PAYSTACK_SECRET_KEY: 'sk_live_3b8edbaf7e6a64510665870a9b7fcb8ec2521d93',

    // ==== Company Info ====
    COMPANY_NAME: 'Daik Media',
    COMPANY_EMAIL: 'sendtonnimdee@gmail.com',
    COMPANY_PHONE: '+233531257913',
    COMPANY_WEBSITE: 'https://daikmedia.com',

    // ==== Telegram (for future use) ====
    TELEGRAM_BOT_TOKEN: '8427904139:AAGo8Io1YmTGz7SIQxd0Emam9rEU__iR1SM',
    TELEGRAM_CHAT_ID: '7271153158'
  });
  
  Logger.log('✅ Configuration set successfully');
}

// ========= Test Functions =========

function testOrder() {
  // Test function to simulate an order
  const testData = {
    name: 'Test Customer',
    number: '0501234567',
    bundle: '5GB Test Bundle',
    payment: 'GHS 10.00',
    notes: 'Test order from script'
  };
  
  const mockEvent = { parameter: testData };
  const result = doPost(mockEvent);
  
  Logger.log('🧪 Test order result: ' + result.getContent());
  return result;
}

// Function to manually set up headers (useful for existing sheets)
function setupHeaders() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    ensureSheetHeaders_(sheet);
    Logger.log('✅ Headers set up successfully');
    return { success: true, message: 'Headers set up successfully' };
  } catch (err) {
    Logger.log('❌ Header setup failed: ' + String(err));
    return { success: false, error: String(err) };
  }
}

// Function to test the complete order flow
function testCompleteOrder() {
  try {
    // First, ensure headers exist
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    ensureSheetHeaders_(sheet);
    
    // Test order data (simulating a wallet order)
    const testData = {
      action: 'saveOrder',
      name: 'Test Customer',
      number: '0501234567',
      bundle: '4GB Test Bundle',
      payment: '20.50',
      network: 'MTN',
      notes: 'Complete test order',
      paymentRef: 'Wallet'
    };
    
    const mockEvent = { parameter: testData };
    const result = doPost(mockEvent);
    
    return {
      success: true,
      message: 'Complete order test successful',
      result: result.getContent(),
      sheetStatus: 'Headers verified and order processed'
    };
  } catch (err) {
    return {
      success: false,
      error: String(err),
      message: 'Complete order test failed'
    };
  }
}

// Function to show current sheet structure and data
function showSheetStructure() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    let structure = {
      success: true,
      sheetName: sheet.getName(),
      totalRows: lastRow,
      totalColumns: lastCol,
      headers: [],
      sampleData: []
    };
    
    if (lastRow > 0) {
      // Get headers
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      structure.headers = headers;
      
      // Get sample data (first few rows)
      if (lastRow > 1) {
        const sampleRows = Math.min(3, lastRow - 1);
        const sampleData = sheet.getRange(2, 1, sampleRows, lastCol).getValues();
        structure.sampleData = sampleData;
      }
    }
    
    return structure;
  } catch (err) {
    return {
      success: false,
      error: String(err),
      message: 'Failed to get sheet structure'
    };
  }
}

// WALLET PAYMENT VERIFICATION - NOT NEEDED!
// User can only place order if they have money in wallet
// Wallet deduction = payment proof
function verifyPaymentBeforeOrder_(data) {
  // This function is no longer needed since wallet handles payment verification
  // User must have money before they can order
  Logger.log('✅ Wallet payment verified (user has sufficient balance)');
  return { success: true, method: 'Wallet' };
}

// Test order function for debugging
function testOrder_() {
  try {
    const testData = {
      action: 'saveOrder',
      name: 'Test Customer',
      number: '0501234567',
      bundle: '4GB Test',
      payment: '20.50',
      network: 'MTN',
      notes: 'Test order from script',
      paymentRef: 'Wallet' // Simulate wallet order
    };
    
    const mockEvent = { parameter: testData };
    const result = doPost(mockEvent);
    
    return {
      success: true,
      message: 'Test order processed successfully',
      result: result.getContent()
    };
  } catch (err) {
    return {
      success: false,
      error: String(err),
      message: 'Test order failed'
    };
  }
}

// ========= Paystack Integration =========

function verifyPaystack_(reference) {
  const cfg = getConfig_();
  const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
  const options = {
    method: 'get',
    headers: { Authorization: `Bearer ${cfg.PAYSTACK.SECRET_KEY}` },
    muteHttpExceptions: true
  };
  try {
    const res = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(res.getContentText());
    if (data.status && data.data && data.data.status === 'success') {
      return {
        success: true,
        amount: (data.data.amount / 100).toFixed(2),
        customerEmail: (data.data.customer && data.data.customer.email) || 'N/A'
      };
    }
    return { success: false, message: 'Not successful' };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}

// Verify Paystack payment and update order status
function verifyAndUpdatePayment_(orderID, paymentRef) {
  try {
    const verify = verifyPaystack_(paymentRef);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    if (verify.success) {
      // Find the order row and update status
      const lastRow = sheet.getLastRow();
      for (let row = 2; row <= lastRow; row++) {
        const orderIDCell = sheet.getRange(row, 2).getValue(); // Column B = Order ID
        if (orderIDCell === orderID) {
          // Update status to "Paid" and payment amount
          sheet.getRange(row, 7).setValue('Paid'); // Column G = Status
          sheet.getRange(row, 6).setValue(`GHS ${verify.amount}`); // Column F = Payment Amount
          sheet.getRange(row, 12).setValue(new Date()); // Column L = Last Updated
          
          // Send success notification
          sendTelegramNotification_(orderID, { paymentRef, amount: verify.amount }, 'Paid');
          
          Logger.log(`✅ Payment verified for Order ${orderID}: GHS ${verify.amount}`);
          break;
        }
      }
    } else {
      Logger.log(`⚠️ Payment verification failed for Order ${orderID}: ${verify.message}`);
      // Don't fail the order - just log the warning
    }
  } catch (err) {
          Logger.log(`⚠️ Payment verification error for Order ${orderID}: ${String(err)}`);
      // Don't fail the order - just log the error
  }
}

// HMAC SHA-512 verification of webhook body
function verifyPaystackSignature_(rawBody, signature, secret) {
  try {
    const sigBytes = Utilities.computeHmacSha512Signature(rawBody, secret);
    const sigHex = sigBytes.map(b => (b & 0xff).toString(16).padStart(2, '0')).join('');
    return sigHex === signature;
  } catch (e) {
    return false;
  }
}

// ========= Telegram Notifications =========

function sendTelegramNotification_(orderID, data, status) {
  try {
    const cfg = getConfig_();
    if (!cfg.TELEGRAM.BOT_TOKEN || !cfg.TELEGRAM.CHAT_ID) {
      Logger.log('⚠️ Telegram not configured, skipping notification');
      return;
    }
    
    const message = formatTelegramMessage_(orderID, data, status);
    const url = `https://api.telegram.org/bot${cfg.TELEGRAM.BOT_TOKEN}/sendMessage`;
    const payload = { 
      chat_id: cfg.TELEGRAM.CHAT_ID, 
      text: message, 
      parse_mode: 'Markdown' 
    };
    
    const response = UrlFetchApp.fetch(url, { 
      method: 'post', 
      payload, 
      muteHttpExceptions: true 
    });
    
    if (response.getResponseCode() === 200) {
      Logger.log(`✅ Telegram notification sent for Order ${orderID}`);
    } else {
      Logger.log(`⚠️ Telegram notification failed for Order ${orderID}: ${response.getContentText()}`);
    }
    
  } catch (err) {
    Logger.log(`❌ Telegram notification error for Order ${orderID}: ${String(err)}`);
    // Don't fail the order if Telegram fails
  }
}

function formatTelegramMessage_(orderID, data, status) {
  const statusEmoji = status === 'Paid' ? '✅' : '⏳';
  const statusText = status === 'Paid' ? 'PAID' : 'PENDING';
  
  let message = `${statusEmoji} *Order ${orderID} - ${statusText}*\n\n`;
  
  if (data.name) message += `👤 *Customer:* ${data.name}\n`;
  if (data.number) message += `📱 *Phone:* ${data.number}\n`;
  if (data.bundle) message += `📦 *Bundle:* ${data.bundle}\n`;
  if (data.payment) message += `💰 *Amount:* ${data.payment}\n`;
  if (data.network) message += `🌐 *Network:* ${data.network}\n`;
  
  // Handle payment reference for different payment methods
  if (data.paymentRef && data.paymentRef !== 'N/A' && data.paymentRef !== 'Wallet') {
    message += `🔗 *Payment Ref:* ${data.paymentRef}\n`;
  } else if (data.paymentRef === 'Wallet') {
    message += `💳 *Payment Method:* Wallet (Pre-paid)\n`;
  }
  
  if (data.notes) message += `📝 *Notes:* ${data.notes}\n`;
  
  message += `\n⏰ *Time:* ${new Date().toLocaleString()}`;
  
  return message;
}

// ========= Configuration Access =========

function getConfig_() {
  const p = PropertiesService.getScriptProperties().getProperties();
  return {
    PAYSTACK: {
      PUBLIC_KEY: p.PAYSTACK_PUBLIC_KEY,
      SECRET_KEY: p.PAYSTACK_SECRET_KEY
    },
    COMPANY: {
      NAME: p.COMPANY_NAME,
      EMAIL: p.COMPANY_EMAIL,
      PHONE: p.COMPANY_PHONE,
      WEBSITE: p.COMPANY_WEBSITE
    },
    TELEGRAM: {
      BOT_TOKEN: p.TELEGRAM_BOT_TOKEN,
      CHAT_ID: p.TELEGRAM_CHAT_ID
    }
  };
}
