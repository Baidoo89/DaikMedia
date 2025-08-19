// Wallet System JavaScript

// Paystack Configuration - Keys are now handled by Google Apps Script
// const PAYSTACK_PUBLIC_KEY = CONFIG.PAYSTACK.PUBLIC_KEY; // REMOVED
// const PAYSTACK_SECRET_KEY = CONFIG.PAYSTACK.SECRET_KEY; // REMOVED

// Initialize wallet data with better error handling
let walletBalance = 0;
let transactions = [];

// Load wallet data from localStorage with fallback
function loadWalletData() {
  try {
    // Try to load from localStorage
    const storedBalance = localStorage.getItem('walletBalance');
    const storedTransactions = localStorage.getItem('transactions');
    
    if (storedBalance !== null) {
      walletBalance = parseFloat(storedBalance) || 0;
    }
    
    if (storedTransactions !== null) {
      transactions = JSON.parse(storedTransactions) || [];
    }
    
    console.log('✅ Wallet data loaded from localStorage:', { walletBalance, transactionCount: transactions.length });
    
    // Also try to load from server as backup
    loadWalletFromServer();
    
  } catch (error) {
    console.error('❌ Error loading wallet data from localStorage:', error);
    // Try to load from server as fallback
    loadWalletFromServer();
  }
}

// Load wallet data from server as backup
async function loadWalletFromServer() {
  try {
    const scriptURL = CONFIG.GOOGLE_SHEETS.SCRIPT_URL;
    const response = await fetch(`${scriptURL}?action=getWalletData`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.walletData) {
        // Update local data with server data
        walletBalance = parseFloat(data.walletData.balance) || 0;
        transactions = data.walletData.transactions || [];
        
        // Update localStorage with server data
        localStorage.setItem('walletBalance', walletBalance.toString());
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        console.log('✅ Wallet data loaded from server backup:', { walletBalance, transactionCount: transactions.length });
        
        // Update display
        updateWalletDisplay();
        loadTransactionHistory();
      }
    }
  } catch (error) {
    console.error('⚠️ Could not load wallet from server (using local data):', error);
  }
}

// Save wallet data to server as backup
async function saveWalletToServer() {
  try {
    const scriptURL = CONFIG.GOOGLE_SHEETS.SCRIPT_URL;
    const formData = new FormData();
    formData.append('action', 'saveWalletData');
    formData.append('balance', walletBalance.toString());
    formData.append('transactions', JSON.stringify(transactions));
    
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log('✅ Wallet data saved to server backup');
    } else {
      console.warn('⚠️ Could not save wallet to server');
    }
  } catch (error) {
    console.error('❌ Error saving wallet to server:', error);
  }
}

// Data packages for different networks
const packageData = {
  MTN: [
    { name: "1GB", price: 5.50, validity: "30 Days" },
    { name: "2GB", price: 10.50, validity: "30 Days" },
    { name: "3GB", price: 15.50, validity: "30 Days" },
    { name: "4GB", price: 20.50, validity: "30 Days" },
    { name: "5GB", price: 27.00, validity: "30 Days" },
    { name: "6GB", price: 34.00, validity: "30 Days" },
    { name: "8GB", price: 40.00, validity: "30 Days" },
    { name: "10GB", price: 46.50, validity: "30 Days" },
    { name: "15GB", price: 66.50, validity: "30 Days" },
    { name: "20GB", price: 88.00, validity: "30 Days" },
    { name: "25GB", price: 112.00, validity: "30 Days" },
    { name: "30GB", price: 139.00, validity: "30 Days" },
    { name: "40GB", price: 165.00, validity: "30 Days" },
    { name: "50GB", price: 208.00, validity: "30 Days" }
  ],
  Telecel: [
    { name: "5GB", price: 27.00, validity: "30 Days" },
    { name: "10GB", price: 52.00, validity: "30 Days" },
    { name: "15GB", price: 72.00, validity: "30 Days" },
    { name: "20GB", price: 89.00, validity: "30 Days" },
    { name: "25GB", price: 107.00, validity: "30 Days" },
    { name: "30GB", price: 130.00, validity: "30 Days" },
    { name: "40GB", price: 175.00, validity: "30 Days" },
    { name: "50GB", price: 228.00, validity: "30 Days" }
  ],
  AirtelTigo: [
    { name: "1GB", price: 5.00, validity: "30 Days" },
    { name: "2GB", price: 9.00, validity: "30 Days" },
    { name: "3GB", price: 14.00, validity: "30 Days" },
    { name: "4GB", price: 18.00, validity: "30 Days" },
    { name: "5GB", price: 22.00, validity: "30 Days" },
    { name: "6GB", price: 25.00, validity: "30 Days" },
    { name: "7GB", price: 30.00, validity: "30 Days" },
    { name: "8GB", price: 35.00, validity: "30 Days" },
    { name: "9GB", price: 40.00, validity: "30 Days" },
    { name: "10GB", price: 42.00, validity: "30 Days" },
    { name: "11GB", price: 44.50, validity: "30 Days" },
    { name: "12GB", price: 50.00, validity: "30 Days" },
    { name: "15GB", price: 60.50, validity: "30 Days" },
    { name: "20GB", price: 78.00, validity: "30 Days" },
    { name: "25GB", price: 98.00, validity: "30 Days" },
    { name: "30GB", price: 117.00, validity: "30 Days" },
    { name: "40GB", price: 155.00, validity: "30 Days" },
    { name: "50GB", price: 192.00, validity: "30 Days" },
    { name: "100GB", price: 380.00, validity: "30 Days" }
  ]
};

// Telegram Bot Configuration
const telegramBotToken = "8427904139:AAGo8Io1YmTGz7SIQxd0Emam9rEU__iR1SM";
const chatId = "7271153158";

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  loadWalletData(); // Load data on page load
  updateWalletDisplay();
  setupEventListeners();
  loadTransactionHistory();
  
  // Handle URL parameters for pre-selecting bundles from services page
  handleURLParameters();
  
  // Check if there's already a bundle selected (e.g., from page refresh)
  if (document.getElementById('bundle')) {
    checkOrderEligibility();
  }
});

// Update wallet display
function updateWalletDisplay() {
  const balanceElement = document.getElementById('walletBalance');
  if (balanceElement) {
    balanceElement.textContent = `GH₵${walletBalance.toFixed(2)}`;
    console.log('💰 Wallet display updated:', walletBalance);
  } else {
    console.warn('⚠️ Wallet balance element not found');
  }
  
  // Update wallet statistics
  updateWalletStats();
}

// Manual refresh function for troubleshooting
function refreshWallet() {
  console.log('🔄 Manual wallet refresh requested');
  
  // Reload from localStorage
  loadWalletData();
  
  // Update display
  updateWalletDisplay();
  loadTransactionHistory();
  
  // Show user-friendly confirmation
  const status = walletBalance > 0 ? '✅ Active' : '⚠️ Empty';
  const message = `
🔄 **Wallet Refreshed Successfully!**

💰 **Current Balance:** GH₵${walletBalance.toFixed(2)}
📊 **Total Transactions:** ${transactions.length}
💡 **Status:** ${status}

${walletBalance > 0 ? 'Your wallet is ready for orders!' : 'Load money to start ordering data bundles.'}
  `;
  
  showSuccessModal(
    'Wallet Refreshed',
    message,
    true
  );
}

// Debug wallet function
function debugWallet() {
  console.log('🔍 Wallet Debug Information:', {
    currentBalance: walletBalance,
    transactionCount: transactions.length,
    localStorageBalance: localStorage.getItem('walletBalance'),
    localStorageTransactions: localStorage.getItem('transactions'),
    recentTransactions: transactions.slice(0, 3)
  });
  
  // Show user-friendly wallet status
  const recentActivity = transactions.slice(0, 3).map(t => {
    const type = t.type === 'credit' ? 'Added' : 'Spent';
    const date = new Date(t.date).toLocaleDateString();
    return `${type} GH₵${t.amount} on ${date}`;
  }).join('\n');
  
  const debugInfo = `
🔍 **Wallet Status Report**

💰 **Current Balance:** GH₵${walletBalance.toFixed(2)}
📊 **Total Transactions:** ${transactions.length}
📅 **Last Activity:** ${transactions.length > 0 ? new Date(transactions[0].date).toLocaleDateString() : 'No activity yet'}

📝 **Recent Activity:**
${recentActivity || 'No recent transactions'}

💡 **Status:** ${walletBalance > 0 ? '✅ Wallet Active' : '⚠️ Wallet Empty'}
  `;
  
  showSuccessModal(
    'Wallet Status Report',
    debugInfo,
    true
  );
}

// Update wallet statistics
function updateWalletStats() {
  // Calculate totals from transaction history
  let totalLoaded = 0;
  let totalSpent = 0;
  
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
  
  console.log('📊 Wallet stats updated:', { totalLoaded, totalSpent, currentBalance: walletBalance });
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
  
  console.log('Network selected:', network); // Debug log
  
  // Clear previous bundles
  bundleSelect.innerHTML = '<option value="">-- Select Bundle --</option>';
  if (orderSummary) orderSummary.style.display = 'none';
  if (submitBtn) submitBtn.disabled = true;
  
  if (!network) return;
  
  // Get bundles for selected network
  const networkBundles = packageData[network] || [];
  console.log('Network bundles found:', networkBundles); // Debug log
  
  // Populate bundle options with prices
  networkBundles.forEach(bundle => {
    const option = document.createElement('option');
    option.value = `${bundle.name} - GH₵${bundle.price}`;
    option.textContent = `${bundle.name} - GH₵${bundle.price}`;
    bundleSelect.appendChild(option);
  });
  
  console.log('Bundle options added:', bundleSelect.options.length); // Debug log
  
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
    if (orderSummary) orderSummary.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;
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
  
  if (orderSummary) {
    orderSummary.innerHTML = orderSummaryHtml;
    orderSummary.style.display = 'block';
  }
  
  // Enable/disable submit button based on balance
  if (submitBtn) {
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
}

// Modal functions
function openLoadMoneyModal() {
  const modal = document.getElementById('loadMoneyModal');
  if (modal) modal.style.display = 'block';
}

function closeLoadMoneyModal() {
  const modal = document.getElementById('loadMoneyModal');
  if (modal) modal.style.display = 'none';
}

function openTransactionHistory() {
  const modal = document.getElementById('transactionModal');
  if (modal) {
    modal.style.display = 'block';
    loadTransactionHistory();
  }
}

function closeTransactionHistory() {
  const modal = document.getElementById('transactionModal');
  if (modal) modal.style.display = 'none';
}

function showSuccessModal(title, message, isSuccess = true) {
  const successContent = document.getElementById('successContent');
  const successModal = document.getElementById('successModal');
  
  if (successContent && successModal) {
    const icon = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    const color = isSuccess ? '#28a745' : '#dc3545';
    
    successContent.innerHTML = `
      <i class="${icon}" style="color: ${color}"></i>
      <h3>${title}</h3>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="closeSuccessModal()">OK</button>
    `;
    
    successModal.style.display = 'block';
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.style.display = 'none';
}

// Payment processing functions
function processMoMoPayment() {
  const amount = parseFloat(document.getElementById('momoAmount').value);
  if (!amount || amount < 1) {
    alert('Please enter a valid amount (minimum GH₵1)');
    return;
  }
  
  // Show loading state
  const momoBtn = document.querySelector('[onclick="processMoMoPayment()"]');
  const originalText = momoBtn.innerHTML;
  momoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  momoBtn.disabled = true;
  
  // Get Paystack key from Google Apps Script
  getPaystackKey().then(publicKey => {
    if (!publicKey) {
      showSuccessModal('❌ Configuration Error', 'Paystack is not configured. Please contact support.', false);
      momoBtn.innerHTML = originalText;
      momoBtn.disabled = false;
      return;
    }
    
    // Initialize Paystack mobile money payment
    const handler = PaystackPop.setup({
      key: publicKey,
      email: 'customer@daikmedia.com', // You can make this dynamic
      amount: Math.round(amount * 100), // Paystack expects amount in kobo
      currency: 'GHS',
      channels: ['mobile_money'], // Enable mobile money channels
      callback: function(response) {
        console.log('✅ MoMo payment successful:', response);
        
        // Verify the payment actually worked
        if (response.status === 'success' && response.reference) {
          // Add to wallet with proper error handling
          const result = addToWallet(amount, 'Paystack Mobile Money');
          
          if (result.success) {
            showSuccessModal(
              'Payment Successful! 🎉',
              `Your wallet has been credited with GH₵${amount.toFixed(2)}.
              
Transaction ID: ${response.reference}
Reference: ${result.transaction.reference}

You can now place your orders!`,
              true
            );
            
            closeLoadMoneyModal();
            
            // Log successful payment
            console.log('✅ MoMo payment processed and wallet credited:', {
              amount: amount,
              paystackRef: response.reference,
              walletRef: result.transaction.reference,
              newBalance: result.newBalance
            });
          } else {
            // Payment succeeded but wallet credit failed
            showSuccessModal(
              '⚠️ Payment Received, Wallet Issue',
              `Your payment of GH₵${amount.toFixed(2)} was successful, but there was an issue crediting your wallet. Please contact support with Transaction ID: ${response.reference}`,
              false
            );
          }
        } else {
          showSuccessModal(
            '⚠️ Payment Issue',
            'Payment was received but there was an issue. Please contact support.',
            false
          );
        }
        
        // Reset button
        momoBtn.innerHTML = originalText;
        momoBtn.disabled = false;
      },
      onClose: function() {
        // Payment cancelled
        alert('Payment was cancelled. Please try again.');
        
        // Reset button
        momoBtn.innerHTML = originalText;
        momoBtn.disabled = false;
      }
    });
    
    handler.openIframe();
  }).catch(error => {
    console.error('❌ Error getting Paystack key:', error);
    showSuccessModal('❌ Configuration Error', 'Unable to load payment configuration. Please contact support.', false);
    momoBtn.innerHTML = originalText;
    momoBtn.disabled = false;
  });
}

function processBankPayment() {
  const amount = parseFloat(document.getElementById('bankAmount').value);
  if (!amount || amount < 10) {
    alert('Please enter a valid amount (minimum GH₵10)');
    return;
  }
  
  // Show loading state
  const bankBtn = document.querySelector('[onclick="processBankPayment()"]');
  const originalText = bankBtn.innerHTML;
  bankBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  bankBtn.disabled = true;
  
  // Get Paystack key from Google Apps Script
  getPaystackKey().then(publicKey => {
    if (!publicKey) {
      showSuccessModal('❌ Configuration Error', 'Paystack is not configured. Please contact support.', false);
      bankBtn.innerHTML = originalText;
      bankBtn.disabled = false;
      return;
    }
    
    // Initialize Paystack bank transfer payment
    const handler = PaystackPop.setup({
      key: publicKey,
      email: 'customer@daikmedia.com', // You can make this dynamic
      amount: Math.round(amount * 100), // Paystack expects amount in kobo
      currency: 'GHS',
      channels: ['bank'], // Enable bank transfer channels
      callback: function(response) {
        console.log('✅ Bank transfer successful:', response);
        
        // Verify the payment actually worked
        if (response.status === 'success' && response.reference) {
          // Add to wallet with proper error handling
          const result = addToWallet(amount, 'Paystack Bank Transfer');
          
          if (result.success) {
            showSuccessModal(
              'Payment Successful! 🎉',
              `Your wallet has been credited with GH₵${amount.toFixed(2)}.
              
Transaction ID: ${response.reference}
Reference: ${result.transaction.reference}

You can now place your orders!`,
              true
            );
            
            closeLoadMoneyModal();
            
            // Log successful payment
            console.log('✅ Bank transfer processed and wallet credited:', {
              amount: amount,
              paystackRef: response.reference,
              walletRef: result.transaction.reference,
              newBalance: result.newBalance
            });
          } else {
            // Payment succeeded but wallet credit failed
            showSuccessModal(
              '⚠️ Payment Received, Wallet Issue',
              `Your payment of GH₵${amount.toFixed(2)} was successful, but there was an issue crediting your wallet. Please contact support with Transaction ID: ${response.reference}`,
              false
            );
          }
        } else {
          showSuccessModal(
            '⚠️ Payment Issue',
            'Payment was received but there was an issue. Please contact support.',
            false
          );
        }
        
        // Reset button
        bankBtn.innerHTML = originalText;
        bankBtn.disabled = false;
      },
      onClose: function() {
        // Payment cancelled
        alert('Payment was cancelled. Please try again.');
        
        // Reset button
        bankBtn.innerHTML = originalText;
        bankBtn.disabled = false;
      }
    });
    
    handler.openIframe();
  }).catch(error => {
    console.error('❌ Error getting Paystack key:', error);
    showSuccessModal('❌ Configuration Error', 'Unable to load payment configuration. Please contact support.', false);
    bankBtn.innerHTML = originalText;
    bankBtn.disabled = false;
  });
}

function processCashAppPayment() {
  const amount = parseFloat(document.getElementById('cashappAmount').value);
  if (!amount || amount < 1) {
    alert('Please enter a valid amount (minimum GH₵1)');
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
  
  if (!amount || amount < 1) {
    alert('Please enter a valid amount (minimum GH₵1)');
    return;
  }
  
  // Show loading state
  const cardBtn = document.querySelector('[onclick="processCardPayment()"]');
  const originalText = cardBtn.innerHTML;
  cardBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  cardBtn.disabled = true;
  
  // Get Paystack key from Google Apps Script
  getPaystackKey().then(publicKey => {
    if (!publicKey) {
      showSuccessModal('❌ Configuration Error', 'Paystack is not configured. Please contact support.', false);
      cardBtn.innerHTML = originalText;
      cardBtn.disabled = false;
      return;
    }
    
    // Initialize Paystack payment
    const handler = PaystackPop.setup({
      key: publicKey,
      email: 'customer@daikmedia.com', // You can make this dynamic
      amount: Math.round(amount * 100), // Paystack expects amount in kobo (smallest currency unit)
      currency: 'GHS',
      callback: function(response) {
        console.log('✅ Card payment successful:', response);
        
        // Verify the payment actually worked
        if (response.status === 'success' && response.reference) {
          // Add to wallet with proper error handling
          const result = addToWallet(amount, 'Paystack Card Payment');
          
          if (result.success) {
            showSuccessModal(
              'Payment Successful! 🎉',
              `Your wallet has been credited with GH₵${amount.toFixed(2)}.
              
Transaction ID: ${response.reference}
Reference: ${result.transaction.reference}

You can now place your orders!`,
              true
            );
            
            closeLoadMoneyModal();
            
            // Log successful payment
            console.log('✅ Card payment processed and wallet credited:', {
              amount: amount,
              paystackRef: response.reference,
              walletRef: result.transaction.reference,
              newBalance: result.newBalance
            });
          } else {
            // Payment succeeded but wallet credit failed
            showSuccessModal(
              '⚠️ Payment Received, Wallet Issue',
              `Your payment of GH₵${amount.toFixed(2)} was successful, but there was an issue crediting your wallet. Please contact support with Transaction ID: ${response.reference}`,
              false
            );
          }
        } else {
          showSuccessModal(
            '⚠️ Payment Issue',
            'Payment was received but there was an issue. Please contact support.',
            false
          );
        }
        
        // Reset button
        cardBtn.innerHTML = originalText;
        cardBtn.disabled = false;
      },
      onClose: function() {
        // Payment cancelled
        alert('Payment was cancelled. Please try again.');
        
        // Reset button
        cardBtn.innerHTML = originalText;
        cardBtn.disabled = false;
      }
    });
    
    handler.openIframe();
  }).catch(error => {
    console.error('❌ Error getting Paystack key:', error);
    showSuccessModal('❌ Configuration Error', 'Unable to load payment configuration. Please contact support.', false);
    cardBtn.innerHTML = originalText;
    cardBtn.disabled = false;
  });
}

// Wallet functions
function addToWallet(amount, method) {
  try {
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('❌ Invalid amount for wallet:', amount);
      throw new Error('Invalid amount');
    }
    
    // Store old balance for comparison
    const oldBalance = walletBalance;
    
    // Add to wallet balance
    walletBalance += amount;
    
    // Validate the addition worked
    if (walletBalance !== oldBalance + amount) {
      console.error('❌ Wallet balance calculation error');
      throw new Error('Balance calculation failed');
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('walletBalance', walletBalance.toString());
      console.log('✅ Wallet balance saved to localStorage:', walletBalance);
    } catch (localError) {
      console.error('❌ Failed to save to localStorage:', localError);
      // Continue anyway - we'll try server backup
    }
    
    // Create transaction record
    const transaction = {
      id: Date.now(),
      type: 'credit',
      amount: amount,
      method: method,
      date: new Date().toISOString(),
      description: `Wallet top-up via ${method}`,
      reference: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Add to transactions array
    transactions.unshift(transaction);
    
    // Save transactions to localStorage
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
      console.log('✅ Transactions saved to localStorage');
    } catch (localError) {
      console.error('❌ Failed to save transactions to localStorage:', localError);
    }
    
    // Save to server as backup
    saveWalletToServer();
    
    // Update display
    updateWalletDisplay();
    updateWalletStats();
    
    // Check if user can now place orders
    if (document.getElementById('bundle')) {
      checkOrderEligibility();
    }
    
    // Log successful addition
    console.log('✅ Successfully added to wallet:', {
      amount: amount,
      method: method,
      oldBalance: oldBalance,
      newBalance: walletBalance,
      transactionId: transaction.id
    });
    
    // Return success with details
    return {
      success: true,
      oldBalance: oldBalance,
      newBalance: walletBalance,
      added: amount,
      transaction: transaction
    };
    
  } catch (error) {
    console.error('❌ Error adding to wallet:', error);
    
    // Revert balance if there was an error
    walletBalance = oldBalance || 0;
    
    // Show error to user
    showSuccessModal(
      '❌ Wallet Error',
      `Failed to add GH₵${amount} to your wallet. Please contact support. Error: ${error.message}`,
      false
    );
    
    return {
      success: false,
      error: error.message
    };
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
  if (document.getElementById('bundle')) {
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
async function handleOrderSubmission(e) {
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
  
  // Generate Order ID and create order message
  const orderID = await generateOrderID();
  
  // Create order message
  const orderMessage = `🆕 NEW DATA ORDER RECEIVED! 📱

🆔 Order ID: ${orderID}
👤 Customer Name: ${name}
📞 Phone Number: ${number}
🌐 Network: ${network}
📦 Data Bundle: ${bundle}
💰 Payment: Wallet (GH₵${price.toFixed(2)})
📝 Notes: ${notes || 'None'}
⏰ Order Time: ${new Date().toLocaleString()}`;
  
  // Send Telegram notification
  const telegramMessage = `📦 *New Order Received*

🆔 *Order ID: ${orderID}*
👤 Name: ${name}
📱 Number: ${number}
🌐 Network: ${network}
💼 Bundle: ${bundle}
💰 Payment: Wallet (GH₵${price.toFixed(2)})
📝 Notes: ${notes || 'None'}
⏰ Time: ${new Date().toLocaleString()}`;
  
  sendTelegramNotification(telegramMessage);
  
  // Save to Google Sheets - extract bundle name and price separately
  const bundleName = bundle.split(' - ')[0]; // Get just "4GB" from "4GB - GH₵20.50"
  const bundlePrice = bundle.split('GH₵')[1]; // Get just "20.50" from "4GB - GH₵20.50"
  saveToGoogleSheets(name, number, network, bundleName, bundlePrice, notes, orderID)
    .then(() => {
      showSuccessModal(
        'Order Placed Successfully! 🎉',
        `Your ${bundle} order for ${network} has been placed and will be processed shortly.

🆔 **Order ID: ${orderID}**
💰 Amount: GH₵${price.toFixed(2)} (deducted from wallet)

📱 **Save this Order ID for tracking your order status later!**

You will receive updates via SMS/WhatsApp when your order is processed.`,
        true
      );
    })
    .catch(() => {
      showSuccessModal(
        'Order Placed Successfully! 🎉',
        `Your ${bundle} order for ${network} has been placed and will be processed shortly.

🆔 **Order ID: ${orderID}**
💰 Amount: GH₵${price.toFixed(2)} (deducted from wallet)

📱 **Save this Order ID for tracking your order status later!**

You will receive updates via SMS/WhatsApp when your order is processed.`,
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

// Generate sequential Order ID
async function generateOrderID() {
  try {
    const response = await fetch(CONFIG.GOOGLE_SHEETS.SCRIPT_URL + '?action=getNextOrderID', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.orderID) {
      console.log('Generated Order ID:', data.orderID);
      return data.orderID;
    } else {
      throw new Error('No Order ID received from server');
    }
    
  } catch (error) {
    console.error('Error generating Order ID:', error);
    
    // Enhanced fallback: generate timestamp-based ID with random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const fallbackID = `FALLBACK_${timestamp}_${randomSuffix}`;
    
    console.warn('Using fallback Order ID:', fallbackID);
    
    // Show warning to user
    showSuccessModal(
      '⚠️ Order ID Generation Warning',
      `We're experiencing technical difficulties with our Order ID system. Your order will still be processed with a temporary ID: ${fallbackID}`,
      false
    );
    
    return fallbackID;
  }
}

// Save to Google Sheets
async function saveToGoogleSheets(name, number, network, bundle, payment, notes, orderID) {
  try {
    const scriptURL = CONFIG.GOOGLE_SHEETS.SCRIPT_URL;
    
    const formData = new FormData();
    formData.append('action', 'saveOrder');
    formData.append('orderID', orderID);
    formData.append('name', name);
    formData.append('number', number);
    formData.append('bundle', bundle);
    formData.append('network', network);
    formData.append('payment', payment);
    formData.append('paymentMethod', 'Wallet'); // Specify payment method
    formData.append('paymentRef', 'Wallet');   // Set payment reference
    formData.append('notes', notes);
    
    console.log('Sending order data to Google Sheets:', {
      orderID,
      name,
      number,
      bundle,
      network,
      payment,
      notes
    });
    
    const response = await fetch(scriptURL, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (result.success) {
      console.log('Order saved to Google Sheets successfully:', result);
      return result;
    } else {
      throw new Error('Failed to save order to Google Sheets');
    }
    
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    throw error; // Re-throw to be handled by caller
  }
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

// Function to get Paystack public key from Google Apps Script
async function getPaystackKey() {
  try {
    const scriptURL = CONFIG.GOOGLE_SHEETS.SCRIPT_URL;
    const response = await fetch(`${scriptURL}?action=getPaystackKey`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.paystackKey) {
        console.log('✅ Paystack key retrieved successfully');
        return data.paystackKey;
      } else {
        console.error('❌ Paystack key not found in response:', data);
        return null;
      }
    } else {
      console.error('❌ Failed to get Paystack key:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting Paystack key:', error);
    return null;
  }
}

 