const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Paystack Configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// Verify Paystack webhook signature
function verifyPaystackWebhook(req, res, next) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  next();
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Paystack webhook endpoint
app.post('/webhook/paystack', verifyPaystackWebhook, async (req, res) => {
  try {
    const { event, data } = req.body;
    
    if (event === 'charge.success') {
      // Payment was successful
      const { reference, amount, customer, metadata } = data;
      
      console.log('Payment successful:', {
        reference,
        amount: amount / 100, // Convert from kobo to GHS
        customer: customer.email,
        metadata
      });
      
      // Here you would typically:
      // 1. Update your database
      // 2. Send confirmation emails
      // 3. Update wallet balance
      // 4. Send Telegram notifications
      
      // For now, just log the success
      console.log('Payment processed successfully for reference:', reference);
    }
    
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Verify payment endpoint
app.post('/verify-payment', async (req, res) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    const { data } = response.data;
    
    if (data.status === 'success') {
      res.json({
        success: true,
        data: {
          reference: data.reference,
          amount: data.amount / 100,
          currency: data.currency,
          status: data.status,
          customer: data.customer
        }
      });
    } else {
      res.json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Daik Media server running on port ${PORT}`);
  console.log(`📱 Paystack webhook endpoint: http://localhost:${PORT}/webhook/paystack`);
  console.log(`🔍 Payment verification: http://localhost:${PORT}/verify-payment`);
});

module.exports = app;
