// Wallet System JavaScript

// Paystack Configuration
const PAYSTACK_PUBLIC_KEY = CONFIG.PAYSTACK.PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = CONFIG.PAYSTACK.SECRET_KEY;

// Initialize wallet data
let walletBalance = parseFloat(localStorage.getItem('walletBalance')) || 0;
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Data packages for different networks
const packageData = {
  MTN: [
    { name: "1GB", price: 6, validity: "30 Days" },
    { name: "2GB", price: 11, validity: "30 Days" },
    { name: "3GB", price: 16.50, validity: "30 Days" },
    { name: "4GB", price: 21, validity: "30 Days" },
    { name: "5GB", price: 27, validity: "30 Days" },
    { name: "6GB", price: 33, validity: "30 Days" },
    { name: "8GB", price: 42, validity: "30 Days" },
    { name: "10GB", price: 50, validity: "30 Days" },
    { name: "15GB", price: 70, validity: "30 Days" },
    { name: "20GB", price: 90, validity: "30 Days" },
    { name: "25GB", price: 115, validity: "30 Days" },
    { name: "30GB", price: 135, validity: "30 Days" },
    { name: "40GB", price: 178, validity: "30 Days" },
    { name: "50GB", price: 210, validity: "30 Days" }
  ],
  Vodafone: [
    { name: "1GB", price: 5.50, validity: "30 Days" },
    { name: "2GB", price: 10, validity: "30 Days" },
    { name: "3GB", price: 15, validity: "30 Days" },
    { name: "4GB", price: 19, validity: "30 Days" },
    { name: "5GB", price: 24, validity: "30 Days" },
    { name: "6GB", price: 29, validity: "30 Days" },
    { name: "8GB", price: 38, validity: "30 Days" },
    { name: "10GB", price: 45, validity: "30 Days" },
    { name: "15GB", price: 65, validity: "30 Days" },
    { name: "20GB", price: 85, validity: "30 Days" },
    { name: "25GB", price: 105, validity: "30 Days" },
    { name: "30GB", price: 125, validity: "30 Days" },
    { name: "40GB", price: 165, validity: "30 Days" },
    { name: "50GB", price: 200, validity: "30 Days" }
  ],
  AirtelTigo: [
    { name: "1GB", price: 5, validity: "30 Days" },
    { name: "2GB", price: 9, validity: "30 Days" },
    { name: "3GB", price: 13.50, validity: "30 Days" },
    { name: "4GB", price: 17, validity: "30 Days" },
    { name: "5GB", price: 21, validity: "30 Days" },
    { name: "6GB", price: 25, validity: "30 Days" },
    { name: "8GB", price: 33, validity: "30 Days" },
    { name: "10GB", price: 40, validity: "30 Days" },
    { name: "15GB", price: 58, validity: "30 Days" },
    { name: "20GB", price: 75, validity: "30 Days" },
    { name: "25GB", price: 92, validity: "30 Days" },
    { name: "30GB", price: 110, validity: "30 Days" },
    { name: "40GB", price: 145, validity: "30 Days" },
    { name: "50GB", price: 180, validity: "30 Days" }
  ]
};

// Telegram Bot Configuration
const telegramBotToken = "8427904139:AAGo8Io1YmTGz7SIQxd0Emam9rEU__iR1SM";
const chatId = "7271153158";

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  updateWalletDisplay();
  setupEventListeners();
  loadTransactionHistory();
  
  // Handle URL parameters for pre-selecting bundles from services page
  handleURLParameters();
  
  // Check if there's already a bundle selected (e.g., from page refresh)
  if (document.getElementById('bundle').value) {
    checkOrderEligibility();
  }
});

// Update wallet display
function updateWalletDisplay() {
  const balanceElement = document.getElementById('walletBalance');
  if (balanceElement) {
    balanceElement.textContent = `GH₵${walletBalance.toFixed(2)}`;
  }
  
  // Update wallet statistics
  updateWalletStats();
}

// Update wallet statistics
function updateWalletStats() {
  // Calculate totals from transaction history
  let totalLoaded = 0;
  let totalSpent = 0;
  
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.forEach(transaction => {
    if (transaction.type === 'credit') {
      totalLoaded += transaction.amount;
    } else if (transaction.type === 'debit') {
      totalSpent += transaction.amount;
    }
  });
  
  // Update display elements
  const totalLoadedElement = document.getElementById('totalLoaded');
  const totalSpentElement = document.getElementById('totalSpent');
  
  if (totalLoadedElement) {
    totalLoadedElement.textContent = `GH₵${totalLoaded.toFixed(2)}`;
  }
  
  if (totalSpentElement) {
    totalSpentElement.textContent = `GH₵${totalSpent.toFixed(2)}`;
  }
  
  // Update transaction summary modal if open
  const totalLoadedSummary = document.getElementById('totalLoadedSummary');
  const totalSpentSummary = document.getElementById('totalSpentSummary');
  const currentBalanceSummary = document.getElementById('currentBalanceSummary');
  
  if (totalLoadedSummary) {
    totalLoadedSummary.textContent = `GH₵${totalLoaded.toFixed(2)}`;
  }
  
  if (totalSpentSummary) {
    totalSpentSummary.textContent = `GH₵${totalSpent.toFixed(2)}`;
  }
  
  if (currentBalanceSummary) {
    currentBalanceSummary.textContent = `GH₵${walletBalance.toFixed(2)}`;
  }
}

// Handle URL parameters for pre-selecting bundles from services page
function handleURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const bundle = urlParams.get('bundle');
  const price = urlParams.get('price');
  const network = urlParams.get('network');
  
  if (bundle && price && network) {
    // Pre-select the network
    const networkSelect = document.getElementById('network');
    if (networkSelect) {
      networkSelect.value = network;
      
      // Trigger bundle update
      updateBundles();
      
      // Wait for bundles to load, then pre-select the bundle
      setTimeout(() => {
        const bundleSelect = document.getElementById('bundle');
        if (bundleSelect) {
          const bundleValue = `${bundle} - GH₵${price}`;
          bundleSelect.value = bundleValue;
          
          // Check order eligibility with the pre-selected bundle
          checkOrderEligibility();
          
          // Scroll to order form
          const orderSection = document.querySelector('.order-section');
          if (orderSection) {
            orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    }
  }
}

// Setup event listeners
function setupEventListeners() {
  // Payment tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchPaymentTab(tabName);
    });
  });

  // Bundle selection is now handled in updateBundles() function

  // Form submission
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmission);
  }

  // Transaction filters
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filterType = this.getAttribute('data-filter');
      filterTransactions(filterType);
      
      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// Switch payment tabs
function switchPaymentTab(tabName) {
  // Remove active class from all tabs and content
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.payment-content').forEach(content => content.classList.remove('active'));
  
  // Add active class to selected tab and content
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// Update bundles when network changes
function updateBundles() {
  const network = document.getElementById('network').value;
  const bundleSelect = document.getElementById('bundle');
  const orderSummary = document.getElementById('orderSummary');
  const submitBtn = document.getElementById('submitBtn');
  
  // Clear previous bundles
  bundleSelect.innerHTML = '<option value="">-- Select Bundle --</option>';
  orderSummary.style.display = 'none';
  submitBtn.disabled = true;
  
  if (!network) return;
  
  // Get bundles for selected network
  const networkBundles = packageData[network] || [];
  
  // Populate bundle options with prices
  networkBundles.forEach(bundle => {
    const option = document.createElement('option');
    option.value = `${bundle.name} - GH₵${bundle.price}`;
    option.textContent = `${bundle.name} - GH₵${bundle.price}`;
    bundleSelect.appendChild(option);
  });
  
  // Add change event listener to bundle select
  bundleSelect.onchange = function() {
    checkOrderEligibility();
  };
}

// Check if user can place order based on balance
function checkOrderEligibility() {
  const bundle = document.getElementById('bundle').value;
  const orderSummary = document.getElementById('orderSummary');
  const submitBtn = document.getElementById('submitBtn');
  
  if (!bundle) {
    orderSummary.style.display = 'none';
    submitBtn.disabled = true;
    return;
  }
  
  // Extract price from bundle value
  const price = parseFloat(bundle.split('GH₵')[1]);
  const orderSummaryHtml = `
    <h3>📋 Order Summary</h3>
    <div class="summary-item">
      <span>Bundle Cost:</span>
      <span id="bundleCost">GH₵${price.toFixed(2)}</span>
    </div>
    <div class="summary-item">
      <span>Wallet Balance:</span>
      <span id="summaryBalance">GH₵${walletBalance.toFixed(2)}</span>
    </div>
    <div class="summary-item ${walletBalance >= price ? 'sufficient' : 'insufficient'}">
      <span>Status:</span>
      <span id="orderStatus">
        ${walletBalance >= price ? '✅ Sufficient Balance' : '❌ Insufficient Balance'}
      </span>
    </div>
    ${walletBalance < price ? `
      <div class="insufficient-balance-warning">
        <div class="warning-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="warning-content">
          <h4>Insufficient Balance</h4>
          <p>You need GH₵${(price - walletBalance).toFixed(2)} more to place this order.</p>
          <button class="warning-btn primary" onclick="openLoadMoneyModal()">
            <i class="fas fa-plus"></i>
            Load Money to Wallet
          </button>
        </div>
      </div>
    ` : ''}
  `;
  
  orderSummary.innerHTML = orderSummaryHtml;
  orderSummary.style.display = 'block';
  
  // Enable/disable submit button based on balance
  if (walletBalance >= price) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <span class="btn-text">🚀 Place Order</span>
      <span class="loading" style="display: none;"></span>
    `;
  } else {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="btn-text">💳 Load Money First</span>
      <span class="loading" style="display: none;"></span>
    `;
  }
}

// This function has been replaced by checkOrderEligibility()

// Modal functions
function openLoadMoneyModal() {
  document.getElementById('loadMoneyModal').style.display = 'block';
}

function closeLoadMoneyModal() {
  document.getElementById('loadMoneyModal').style.display = 'none';
}

function openTransactionHistory() {
  document.getElementById('transactionModal').style.display = 'block';
  loadTransactionHistory();
}

function closeTransactionHistory() {
  document.getElementById('transactionModal').style.display = 'none';
}

function showSuccessModal(title, message, isSuccess = true) {
  const successContent = document.getElementById('successContent');
  const icon = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
  const color = isSuccess ? '#28a745' : '#dc3545';
  
  successContent.innerHTML = `
    <i class="${icon}" style="color: ${color}"></i>
    <h3>${title}</h3>
    <p>${message}</p>
    <button class="btn btn-primary" onclick="closeSuccessModal()">OK</button>
  `;
  
  document.getElementById('successModal').style.display = 'block';
}

function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
}

// Payment processing functions
function processMoMoPayment() {
  const amount = parseFloat(document.getElementById('momoAmount').value);
  if (!amount || amount < 5) {
    alert('Please enter a valid amount (minimum GH₵5)');
    return;
  }
  
  // Initialize Paystack mobile money payment
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: 'customer@daikmedia.com', // You can make this dynamic
    amount: Math.round(amount * 100), // Paystack expects amount in kobo
    currency: 'GHS',
    channels: ['mobile_money'], // Enable mobile money channels
    callback: function(response) {
      // Payment successful
      showSuccessModal(
        'Payment Successful!',
        `Your wallet has been credited with GH₵${amount.toFixed(2)}. Transaction ID: ${response.reference}. You can now place your orders.`,
        true
      );
      
      // Add to wallet balance
      addToWallet(amount, 'Paystack Mobile Money');
      closeLoadMoneyModal();
      
      // Log successful payment
      console.log('Mobile money payment successful:', response);
    },
    onClose: function() {
      // Payment cancelled
      alert('Payment was cancelled. Please try again.');
    }
  });
  
  handler.openIframe();
}

function processBankPayment() {
  const amount = parseFloat(document.getElementById('bankAmount').value);
  if (!amount || amount < 10) {
    alert('Please enter a valid amount (minimum GH₵10)');
    return;
  }
  
  // Initialize Paystack bank transfer payment
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: 'customer@daikmedia.com', // You can make this dynamic
    amount: Math.round(amount * 100), // Paystack expects amount in kobo
    currency: 'GHS',
    channels: ['bank'], // Enable bank transfer channels
    callback: function(response) {
      // Payment successful
      showSuccessModal(
        'Payment Successful!',
        `Your wallet has been credited with GH₵${amount.toFixed(2)}. Transaction ID: ${response.reference}. You can now place your orders.`,
        true
      );
      
      // Add to wallet balance
      addToWallet(amount, 'Paystack Bank Transfer');
      closeLoadMoneyModal();
      
      // Log successful payment
      console.log('Bank transfer successful:', response);
    },
    onClose: function() {
      // Payment cancelled
      alert('Payment was cancelled. Please try again.');
    }
  });
  
  handler.openIframe();
}

function processCashAppPayment() {
  const amount = parseFloat(document.getElementById('cashappAmount').value);
  if (!amount || amount < 5) {
    alert('Please enter a valid amount (minimum GH₵5)');
    return;
  }
  
  showSuccessModal(
    'CashApp Payment',
    `Please send GH₵${amount.toFixed(2)} to $DaikMedia via CashApp with your phone number as reference. Your wallet will be credited instantly.`,
    true
  );
  
  closeLoadMoneyModal();
}

function processCardPayment() {
  const amount = parseFloat(document.getElementById('cardAmount').value);
  
  if (!amount || amount < 5) {
    alert('Please enter a valid amount (minimum GH₵5)');
    return;
  }
  
  // Initialize Paystack payment
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: 'customer@daikmedia.com', // You can make this dynamic
    amount: Math.round(amount * 100), // Paystack expects amount in kobo (smallest currency unit)
    currency: 'GHS',
    callback: function(response) {
      // Payment successful
      showSuccessModal(
        'Payment Successful!',
        `Your wallet has been credited with GH₵${amount.toFixed(2)}. Transaction ID: ${response.reference}. You can now place your orders.`,
        true
      );
      
      // Add to wallet balance
      addToWallet(amount, 'Paystack Card Payment');
      closeLoadMoneyModal();
      
      // Log successful payment
      console.log('Payment successful:', response);
    },
    onClose: function() {
      // Payment cancelled
      alert('Payment was cancelled. Please try again.');
    }
  });
  
  handler.openIframe();
}

// Wallet functions
function addToWallet(amount, method) {
  walletBalance += amount;
  localStorage.setItem('walletBalance', walletBalance.toString());
  
  // Add transaction
  const transaction = {
    id: Date.now(),
    type: 'credit',
    amount: amount,
    method: method,
    date: new Date().toISOString(),
    description: `Wallet top-up via ${method}`
  };
  
  transactions.unshift(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  
  updateWalletDisplay();
  updateWalletStats();
  
  // Check if user can now place orders
  if (document.getElementById('bundle').value) {
    checkOrderEligibility();
  }
}

function deductFromWallet(amount, description) {
  if (walletBalance < amount) {
    return false;
  }
  
  walletBalance -= amount;
  localStorage.setItem('walletBalance', walletBalance.toString());
  
  // Add transaction
  const transaction = {
    id: Date.now(),
    type: 'debit',
    amount: amount,
    method: 'Wallet',
    date: new Date().toISOString(),
    description: description
  };
  
  transactions.unshift(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  
  updateWalletDisplay();
  updateWalletStats();
  
  // Check if user can still place orders
  if (document.getElementById('bundle').value) {
    checkOrderEligibility();
  }
  
  return true;
}

// Load transaction history
function loadTransactionHistory() {
  const transactionList = document.getElementById('transactionList');
  if (!transactionList) return;
  
  if (transactions.length === 0) {
    transactionList.innerHTML = `
      <div class="empty-transactions">
        <div class="empty-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <h3>No Transactions Yet</h3>
        <p>Your transaction history will appear here once you start using your wallet.</p>
      </div>
    `;
    return;
  }
  
  transactionList.innerHTML = transactions.map(transaction => `
    <div class="transaction-card ${transaction.type}">
      <div class="transaction-icon">
        <i class="fas fa-${transaction.type === 'credit' ? 'arrow-up' : 'arrow-down'}"></i>
      </div>
      <div class="transaction-content">
        <div class="transaction-header">
          <h4 class="transaction-title">${transaction.description}</h4>
          <span class="transaction-amount ${transaction.type}">
            ${transaction.type === 'credit' ? '+' : '-'}GH₵${transaction.amount.toFixed(2)}
          </span>
        </div>
        <div class="transaction-meta">
          <span class="transaction-method">
            <i class="fas fa-${getMethodIcon(transaction.method)}"></i>
            ${transaction.method}
          </span>
          <span class="transaction-date">
            <i class="fas fa-clock"></i>
            ${formatDate(transaction.date)}
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

// Filter transactions
function filterTransactions(filterType) {
  const transactionList = document.getElementById('transactionList');
  if (!transactionList) return;

  const allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let filteredTransactions = allTransactions;

  if (filterType === 'credit') {
    filteredTransactions = allTransactions.filter(t => t.type === 'credit');
  } else if (filterType === 'debit') {
    filteredTransactions = allTransactions.filter(t => t.type === 'debit');
  }

  transactionList.innerHTML = filteredTransactions.map(transaction => `
    <div class="transaction-card ${transaction.type}">
      <div class="transaction-icon">
        <i class="fas fa-${transaction.type === 'credit' ? 'arrow-up' : 'arrow-down'}"></i>
      </div>
      <div class="transaction-content">
        <div class="transaction-header">
          <h4 class="transaction-title">${transaction.description}</h4>
          <span class="transaction-amount ${transaction.type}">
            ${transaction.type === 'credit' ? '+' : '-'}GH₵${transaction.amount.toFixed(2)}
          </span>
        </div>
        <div class="transaction-meta">
          <span class="transaction-method">
            <i class="fas fa-${getMethodIcon(transaction.method)}"></i>
            ${transaction.method}
          </span>
          <span class="transaction-date">
            <i class="fas fa-clock"></i>
            ${formatDate(transaction.date)}
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

// Get method icon
function getMethodIcon(method) {
  const icons = {
    'MoMo': 'mobile-alt',
    'Bank Transfer': 'university',
    'CashApp': 'dollar-sign',
    'Card Payment': 'credit-card',
    'Wallet': 'wallet'
  };
  return icons[method] || 'money-bill';
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Handle order submission
function handleOrderSubmission(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const number = document.getElementById('number').value.trim();
  const network = document.getElementById('network').value;
  const bundle = document.getElementById('bundle').value;
  const notes = document.getElementById('notes').value.trim();
  
  // Validate required fields
  if (!name || !number || !network || !bundle) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Validate phone number
  if (number.length < 10 || number.length > 15) {
    alert('Please enter a valid phone number.');
    return;
  }
  
  // Get bundle price
  const price = parseFloat(bundle.split('GH₵')[1]);
  
  // Check if wallet has sufficient balance
  if (walletBalance < price) {
    alert('Insufficient wallet balance. Please load money to your wallet first.');
    return;
  }
  
  // Show loading
  const submitButton = document.querySelector('.submit-btn');
  const btnText = submitButton.querySelector('.btn-text');
  const loading = submitButton.querySelector('.loading');
  
  btnText.style.display = 'none';
  loading.style.display = 'inline-block';
  submitButton.disabled = true;
  
  // Deduct from wallet
  const deductionSuccess = deductFromWallet(price, `Data Order: ${bundle} for ${network}`);
  
  if (!deductionSuccess) {
    alert('Failed to process payment. Please try again.');
    resetSubmitButton();
    return;
  }
  
  // Create order message
  const orderMessage = `🆕 NEW DATA ORDER RECEIVED! 📱

👤 Customer Name: ${name}
📞 Phone Number: ${number}
🌐 Network: ${network}
📦 Data Bundle: ${bundle}
💰 Payment: Wallet (GH₵${price.toFixed(2)})
📝 Notes: ${notes || 'None'}
⏰ Order Time: ${new Date().toLocaleString()}`;
  
  // Send Telegram notification
  const telegramMessage = `📦 *New Order Received*

👤 Name: ${name}
📱 Number: ${number}
🌐 Network: ${network}
💼 Bundle: ${bundle}
💰 Payment: Wallet (GH₵${price.toFixed(2)})
📝 Notes: ${notes || 'None'}
⏰ Time: ${new Date().toLocaleString()}`;
  
  sendTelegramNotification(telegramMessage);
  
  // Save to Google Sheets
  saveToGoogleSheets(name, number, network, bundle, 'Wallet', notes)
    .then(() => {
      showSuccessModal(
        'Order Placed Successfully!',
        `Your ${bundle} order for ${network} has been placed and will be processed shortly. GH₵${price.toFixed(2)} has been deducted from your wallet.`,
        true
      );
    })
    .catch(() => {
      showSuccessModal(
        'Order Placed Successfully!',
        `Your ${bundle} order for ${network} has been placed and will be processed shortly. GH₵${price.toFixed(2)} has been deducted from your wallet.`,
        true
      );
    })
    .finally(() => {
      resetSubmitButton();
      document.getElementById('orderForm').reset();
      // Reset order summary display
      const orderSummary = document.getElementById('orderSummary');
      if (orderSummary) {
        orderSummary.style.display = 'none';
      }
    });
}

// Reset submit button
function resetSubmitButton() {
  const submitButton = document.querySelector('.submit-btn');
  const btnText = submitButton.querySelector('.btn-text');
  const loading = submitButton.querySelector('.loading');
  
  btnText.style.display = 'inline';
  loading.style.display = 'none';
  submitButton.disabled = false;
}

// Send Telegram notification
function sendTelegramNotification(message) {
  const telegramURL = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
  fetch(telegramURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log("Telegram notification sent:", data);
  })
  .catch(error => {
    console.error("Telegram notification error:", error);
  });
}

// Save to Google Sheets
function saveToGoogleSheets(name, number, network, bundle, payment, notes) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbzuFDTosabmYvMFlZxSyvp-LmRR09eKFiEUDWA1WlEP5cCPgPoTh82vG4vmsjBb9RypeQ/exec";
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('number', number);
  formData.append('network', network);
  formData.append('bundle', bundle);
  formData.append('payment', payment);
  formData.append('notes', notes);
  
  return fetch(scriptURL, {
    method: "POST",
    body: formData,
  });
}

// Close modals when clicking outside
window.onclick = function(event) {
  const loadMoneyModal = document.getElementById('loadMoneyModal');
  const transactionModal = document.getElementById('transactionModal');
  const successModal = document.getElementById('successModal');
  
  if (event.target === loadMoneyModal) {
    closeLoadMoneyModal();
  }
  if (event.target === transactionModal) {
    closeTransactionHistory();
  }
  if (event.target === successModal) {
    closeSuccessModal();
  }
} 

// Copy to clipboard function
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show success message
    showSuccessModal('Copied to clipboard!', 'The wallet balance has been copied to your clipboard.', true);
  }).catch(err => {
    console.error('Failed to copy: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showSuccessModal('Copied to clipboard!', 'The wallet balance has been copied to your clipboard.', true);
  });
}

// Paystack utility functions
function verifyPaystackPayment(reference) {
  // This function would typically call your backend to verify the payment
  // For now, we'll simulate verification
  console.log('Verifying payment with reference:', reference);
  return true;
}

function generatePaystackReference() {
  // Generate a unique reference for Paystack
  return 'DAIK_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function handlePaystackError(error) {
  console.error('Paystack error:', error);
  alert('Payment failed. Please try again or contact support.');
}

// Function to get customer email (you can make this dynamic)
function getCustomerEmail() {
  // You can implement this to get email from user input or stored data
  return 'customer@daikmedia.com';
} 