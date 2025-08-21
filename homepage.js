// Homepage JavaScript - Basic Improvements
// Phase 1: Essential navigation and UI enhancements

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Homepage.js loaded successfully');
  
  // Mobile navigation toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  // Prevent double-binding across inline scripts and this file
  if (!window.__HAMBURGER_INIT__ && hamburger && navMenu) {
    window.__HAMBURGER_INIT__ = true;
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      console.log('🍔 Mobile menu toggled');
    });
  }
  
  // Close mobile menu when clicking on a link
  const navLinks = document.querySelectorAll('.nav-link');
  if (navLinks && navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (hamburger && navMenu) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
          console.log('🔗 Mobile menu closed after link click');
        }
      });
    });
  }
  
  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        console.log('📜 Smooth scroll to:', targetId);
      }
    });
  });
  
  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.style.background = 'rgba(102, 126, 234, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.transition = 'all 0.3s ease';
      } else {
        navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        navbar.style.backdropFilter = 'none';
      }
    }
  });
  
  // Simple scroll animations for cards
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        console.log('✨ Element animated:', entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements for animation (only if they exist)
  const animateElements = document.querySelectorAll('.feature-card, .service-card, .package-card, .network-card');
  if (animateElements.length > 0) {
    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
    console.log('🎭 Animation observer set up for', animateElements.length, 'elements');
  }
  
  // Services Page Tab Functionality (if exists)
  const tabButtons = document.querySelectorAll('.tab-btn');
  const networkPackages = document.querySelectorAll('.network-packages');

  if (tabButtons.length > 0) {
    console.log('📱 Setting up tab functionality for', tabButtons.length, 'tabs');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const network = button.dataset.network;
        console.log('📱 Tab clicked:', network);
        
        // Remove active class from all buttons and sections
        tabButtons.forEach(btn => btn.classList.remove('active'));
        networkPackages.forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked button and corresponding section
        button.classList.add('active');
        const targetSection = document.getElementById(network);
        
        if (targetSection) {
          targetSection.classList.add('active');
          console.log('✅ Section activated:', network);
        } else {
          console.log('⚠️ Section not found for network:', network);
        }
      });
    });
  }
  
  // FAQ Functionality (if exists)
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    console.log('❓ Setting up FAQ functionality for', faqItems.length, 'items');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      
      if (question) {
        question.addEventListener('click', () => {
          // Close all other FAQ items
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          
          // Toggle current item
          item.classList.toggle('active');
          console.log('❓ FAQ item toggled');
        });
      }
    });
  }
  
  console.log('✅ Homepage.js initialization complete');
});

// Utility function to check if elements exist
function elementExists(selector) {
  return document.querySelector(selector) !== null;
}

// Log page load completion
window.addEventListener('load', function() {
  console.log('🎉 Page fully loaded - Homepage.js ready');
});

// ===== PHASE 2: QUICK ORDER SYSTEM =====

// Bundle data for quick order system
const quickOrderBundles = {
  MTN: [
    { name: '1GB', price: 8.50, validity: '7 Days' },
    { name: '2GB', price: 15.00, validity: '7 Days' },
    { name: '4GB', price: 20.50, validity: '30 Days' },
    { name: '6GB', price: 28.00, validity: '30 Days' },
    { name: '10GB', price: 42.00, validity: '30 Days' },
    { name: '20GB', price: 75.00, validity: '30 Days' }
  ],
  Telecel: [
    { name: '1GB', price: 7.50, validity: '7 Days' },
    { name: '2GB', price: 13.00, validity: '7 Days' },
    { name: '5GB', price: 25.00, validity: '30 Days' },
    { name: '10GB', price: 52.00, validity: '30 Days' },
    { name: '15GB', price: 75.00, validity: '30 Days' },
    { name: '25GB', price: 120.00, validity: '30 Days' }
  ],
  AirtelTigo: [
    { name: '1GB', price: 8.00, validity: '7 Days' },
    { name: '2GB', price: 14.00, validity: '7 Days' },
    { name: '5GB', price: 28.00, validity: '30 Days' },
    { name: '10GB', price: 55.00, validity: '30 Days' },
    { name: '15GB', price: 60.50, validity: '30 Days' },
    { name: '20GB', price: 85.00, validity: '30 Days' }
  ]
};

// Quick Order Modal Functions
function openQuickOrderModal() {
  const modal = document.getElementById('quickOrderModal');
  if (modal) {
    modal.style.display = 'block';
    console.log('🚀 Quick order modal opened');
    
    // Reset form
    document.getElementById('quickOrderForm').reset();
    document.getElementById('quickOrderSummary').style.display = 'none';
    
    // Reset bundle dropdown
    const bundleSelect = document.getElementById('quickBundle');
    bundleSelect.innerHTML = '<option value="">-- Select Network First --</option>';
  }
}

function closeQuickOrderModal() {
  const modal = document.getElementById('quickOrderModal');
  if (modal) {
    modal.style.display = 'none';
    console.log('❌ Quick order modal closed');
  }
}

function updateQuickBundles() {
  const networkSelect = document.getElementById('quickNetwork');
  const bundleSelect = document.getElementById('quickBundle');
  const orderSummary = document.getElementById('quickOrderSummary');
  
  const selectedNetwork = networkSelect.value;
  
  if (selectedNetwork && quickOrderBundles[selectedNetwork]) {
    // Clear existing options
    bundleSelect.innerHTML = '<option value="">-- Select Bundle --</option>';
    
    // Add new bundle options
    quickOrderBundles[selectedNetwork].forEach(bundle => {
      const option = document.createElement('option');
      option.value = `${bundle.name} - ${bundle.price}`;
      option.textContent = `${bundle.name} - GH₵${bundle.price} (${bundle.validity})`;
      bundleSelect.appendChild(option);
    });
    
    console.log(`📱 Updated bundles for ${selectedNetwork}`);
  } else {
    bundleSelect.innerHTML = '<option value="">-- Select Network First --</option>';
  }
  
  // Hide order summary
  orderSummary.style.display = 'none';
}

// Update order summary when bundle is selected
function updateQuickOrderSummary() {
  const networkSelect = document.getElementById('quickNetwork');
  const bundleSelect = document.getElementById('quickBundle');
  const paymentSelect = document.getElementById('quickPayment');
  const orderSummary = document.getElementById('quickOrderSummary');
  
  if (networkSelect.value && bundleSelect.value && paymentSelect.value) {
    const bundleValue = bundleSelect.value;
    const [bundleName, bundlePrice] = bundleValue.split(' - ');
    
    // Update summary display
    document.getElementById('quickBundleSummary').textContent = bundleName;
    document.getElementById('quickNetworkSummary').textContent = networkSelect.value;
    document.getElementById('quickPaymentSummary').textContent = paymentSelect.value;
    document.getElementById('quickCostSummary').textContent = `GH₵${bundlePrice}`;
    
    // Show order summary
    orderSummary.style.display = 'block';
    console.log('📊 Quick order summary updated');
  }
}

// Add event listeners for form updates
document.addEventListener('DOMContentLoaded', function() {
  // Add change listeners for quick order form
  const quickNetwork = document.getElementById('quickNetwork');
  const quickBundle = document.getElementById('quickBundle');
  const quickPayment = document.getElementById('quickPayment');
  
  if (quickNetwork) {
    quickNetwork.addEventListener('change', updateQuickBundles);
  }
  
  if (quickBundle) {
    quickBundle.addEventListener('change', updateQuickOrderSummary);
  }
  
  if (quickPayment) {
    quickPayment.addEventListener('change', updateQuickOrderSummary);
  }
  
  // Quick order form submission
  const quickOrderForm = document.getElementById('quickOrderForm');
  if (quickOrderForm) {
    quickOrderForm.addEventListener('submit', handleQuickOrderSubmission);
    console.log('📝 Quick order form listener added');
  }
});

// Handle quick order form submission
async function handleQuickOrderSubmission(e) {
  e.preventDefault();
  console.log('🚀 Quick order submitted');
  
  const formData = new FormData(e.target);
  const orderData = {
    name: formData.get('quickName') || document.getElementById('quickName').value,
    number: formData.get('quickNumber') || document.getElementById('quickNumber').value,
    network: document.getElementById('quickNetwork').value,
    bundle: document.getElementById('quickBundle').value,
    payment: document.getElementById('quickPayment').value,
    notes: document.getElementById('quickNotes').value
  };
  
  // Validate required fields
  if (!orderData.name || !orderData.number || !orderData.network || !orderData.bundle || !orderData.payment) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Show loading state
  const submitBtn = document.getElementById('quickSubmitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const loading = submitBtn.querySelector('.loading');
  
  btnText.style.display = 'none';
  loading.style.display = 'inline-block';
  submitBtn.disabled = true;
  
  try {
    // Create WhatsApp message
    const bundleValue = orderData.bundle;
    const [bundleName, bundlePrice] = bundleValue.split(' - ');
    
    const message = `🆕 NEW DATA ORDER RECEIVED! 📱

👤 Customer Name: ${orderData.name}
📞 Phone Number: ${orderData.number}
🌐 Network: ${orderData.network}
📦 Data Bundle: ${bundleName}
💰 Price: ${bundlePrice}
💳 Payment Method: ${orderData.payment}
📝 Notes: ${orderData.notes || 'None'}

⏰ Order Time: ${new Date().toLocaleString()}`;
    
    // Send order to Google Sheets and Telegram
    console.log('📊 Sending order to Google Sheets...');
    const sheetsResult = await sendOrderToGoogleSheets(orderData);
    
    if (sheetsResult.success) {
      console.log('✅ Order saved to Google Sheets');
      
      // Show enhanced success message
      showQuickOrderSuccess(message, orderData, sheetsResult.orderId);
      
      // Close modal
      closeQuickOrderModal();
    } else {
      throw new Error('Failed to save order to Google Sheets');
    }
    
  } catch (error) {
    console.error('❌ Quick order error:', error);
    alert('Error processing order. Please try again.');
  } finally {
    // Reset button state
    btnText.style.display = 'inline-block';
    loading.style.display = 'none';
    submitBtn.disabled = false;
  }
}

// Show quick order success message
function showQuickOrderSuccess(message, orderData) {
  const whatsappURL = `https://wa.me/233557574477?text=${encodeURIComponent(message)}`;
  
  const successDiv = document.createElement('div');
  successDiv.className = 'success-popup';
  successDiv.innerHTML = `
    <h3>✅ Order Submitted Successfully!</h3>
    <p>Your order has been received and will be processed shortly. We'll contact you soon!</p>
    <button onclick="sendOrderToWhatsApp('${whatsappURL}')" class="popup-btn whatsapp-btn">
      📱 Send Order to WhatsApp
    </button>
    <button onclick="closeQuickOrderSuccess()" class="popup-btn close-btn">
      Close
    </button>
    <div class="status-text">
      📱 WhatsApp integration ready
    </div>
  `;
  
  document.body.appendChild(successDiv);
  console.log('✅ Quick order success message shown');
}

// Send order to WhatsApp
function sendOrderToWhatsApp(whatsappURL) {
  window.open(whatsappURL, '_blank');
  console.log('📱 Opening WhatsApp with order details');
}

// Close quick order success message
function closeQuickOrderSuccess() {
  const successDiv = document.querySelector('.success-popup');
  if (successDiv) {
    document.body.removeChild(successDiv);
  }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  const modal = document.getElementById('quickOrderModal');
  if (event.target === modal) {
    closeQuickOrderModal();
  }
});

console.log('🚀 Phase 2: Quick Order System loaded');

// ===== PHASE 3: GOOGLE SHEETS & TELEGRAM INTEGRATION =====

// Google Apps Script URL (replace with your actual URL)
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Send order to Google Sheets
async function sendOrderToGoogleSheets(orderData) {
  try {
    const bundleValue = orderData.bundle;
    const [bundleName, bundlePrice] = bundleValue.split(' - ');
    
    const orderPayload = {
      action: 'saveOrder',
      orderData: {
        orderId: generateOrderId(),
        customerName: orderData.name,
        phoneNumber: orderData.number,
        network: orderData.network,
        bundle: bundleName,
        price: parseFloat(bundlePrice),
        paymentMethod: orderData.payment,
        notes: orderData.notes || '',
        orderDate: new Date().toISOString(),
        status: 'Pending',
        source: 'Quick Order System'
      }
    };
    
    console.log('📊 Sending order payload:', orderPayload);
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Google Sheets response:', result);
    
    if (result.success) {
      return { success: true, orderId: orderPayload.orderData.orderId };
    } else {
      throw new Error(result.error || 'Unknown error from Google Sheets');
    }
    
  } catch (error) {
    console.error('❌ Error sending to Google Sheets:', error);
    return { success: false, error: error.message };
  }
}

// Generate unique order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `DAIK-${timestamp}-${randomStr}`.toUpperCase();
}

// Enhanced success message with order ID
function showQuickOrderSuccess(message, orderData, orderId) {
  const whatsappURL = `https://wa.me/233557574477?text=${encodeURIComponent(message)}`;
  
  const successDiv = document.createElement('div');
  successDiv.className = 'success-popup enhanced';
  successDiv.innerHTML = `
    <h3>✅ Order Submitted Successfully!</h3>
    <p>Your order has been received and will be processed shortly. We'll contact you soon!</p>
    
    <div class="order-details">
      <div class="order-id">
        <strong>Order ID:</strong> <span class="order-id-value">${orderId}</span>
      </div>
      <div class="order-status">
        <strong>Status:</strong> <span class="status-pending">⏳ Pending</span>
      </div>
    </div>
    
    <div class="action-buttons">
      <button onclick="sendOrderToWhatsApp('${whatsappURL}')" class="popup-btn whatsapp-btn">
        📱 Send Order to WhatsApp
      </button>
      <button onclick="copyOrderId('${orderId}')" class="popup-btn copy-btn">
        📋 Copy Order ID
      </button>
      <button onclick="closeQuickOrderSuccess()" class="popup-btn close-btn">
        Close
      </button>
    </div>
    
    <div class="status-text">
      📱 WhatsApp integration ready | 📊 Google Sheets saved | 📢 Telegram notified
    </div>
  `;
  
  document.body.appendChild(successDiv);
  console.log('✅ Enhanced quick order success message shown');
}

// Copy order ID to clipboard
function copyOrderId(orderId) {
  navigator.clipboard.writeText(orderId).then(() => {
    // Show temporary success message
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '✅ Copied!';
      copyBtn.style.background = '#28a745';
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.background = '';
      }, 2000);
    }
    console.log('📋 Order ID copied to clipboard:', orderId);
  }).catch(err => {
    console.error('❌ Failed to copy order ID:', err);
    alert('Failed to copy order ID. Please copy manually: ' + orderId);
  });
}

console.log('🚀 Phase 3: Google Sheets & Telegram Integration loaded');

// ===== PHASE 4: ADVANCED FEATURES & PRODUCTION POLISH =====

// Customer Dashboard Functions
function openCustomerDashboard() {
  const dashboardDiv = document.createElement('div');
  dashboardDiv.className = 'customer-dashboard-modal';
  dashboardDiv.innerHTML = `
    <div class="dashboard-content">
      <div class="dashboard-header">
        <h2><i class="fas fa-user-circle"></i> Customer Dashboard</h2>
        <span class="close" onclick="closeCustomerDashboard()">&times;</span>
      </div>
      
      <div class="dashboard-tabs">
        <button class="tab-btn active" onclick="switchDashboardTab('orders')">
          📦 My Orders
        </button>
        <button class="tab-btn" onclick="switchDashboardTab('profile')">
          👤 Profile
        </button>
        <button class="tab-btn" onclick="switchDashboardTab('support')">
          🆘 Support
        </button>
      </div>
      
      <div class="dashboard-content-area">
        <div id="orders-tab" class="tab-content active">
          <div class="orders-list" id="customerOrdersList">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i> Loading orders...
            </div>
          </div>
        </div>
        
        <div id="profile-tab" class="tab-content">
          <div class="profile-info">
            <h3>Account Information</h3>
            <div class="info-item">
              <label>Email:</label>
              <span id="customerEmail">Loading...</span>
            </div>
            <div class="info-item">
              <label>Member Since:</label>
              <span id="memberSince">Loading...</span>
            </div>
            <div class="info-item">
              <label>Total Orders:</label>
              <span id="totalOrders">Loading...</span>
            </div>
          </div>
        </div>
        
        <div id="support-tab" class="tab-content">
          <div class="support-options">
            <h3>Need Help?</h3>
            <div class="support-card">
              <i class="fab fa-whatsapp"></i>
              <h4>WhatsApp Support</h4>
              <p>Get instant help via WhatsApp</p>
              <button onclick="openWhatsAppSupport()" class="support-btn whatsapp">
                Chat Now
              </button>
            </div>
            <div class="support-card">
              <i class="fab fa-telegram"></i>
              <h4>Telegram Support</h4>
              <p>Join our Telegram channel</p>
              <button onclick="openTelegramSupport()" class="support-btn telegram">
                Join Channel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(dashboardDiv);
  loadCustomerData();
  console.log('🚀 Customer dashboard opened');
}

function closeCustomerDashboard() {
  const dashboard = document.querySelector('.customer-dashboard-modal');
  if (dashboard) {
    document.body.removeChild(dashboard);
    console.log('❌ Customer dashboard closed');
  }
}

function switchDashboardTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab content
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  const clickedButton = event.target;
  clickedButton.classList.add('active');
  
  console.log(`📱 Switched to ${tabName} tab`);
}

async function loadCustomerData() {
  try {
    // Load customer profile info
    const currentUser = authFunctions.getCurrentUser();
    if (currentUser) {
      document.getElementById('customerEmail').textContent = currentUser.email;
      document.getElementById('memberSince').textContent = new Date(currentUser.metadata.creationTime).toLocaleDateString();
    }
    
    // Load customer orders (simulated for now)
    await loadCustomerOrders();
    
  } catch (error) {
    console.error('❌ Error loading customer data:', error);
  }
}

async function loadCustomerOrders() {
  try {
    // Simulate loading orders from Google Sheets
    const ordersList = document.getElementById('customerOrdersList');
    
    // Show loading state
    ordersList.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i> Loading orders...
      </div>
    `;
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock orders data
      const mockOrders = [
        {
          orderId: 'DAIK-ABC123',
          network: 'MTN',
          bundle: '4GB',
          price: 'GH₵20.50',
          status: 'Completed',
          date: '2025-01-15'
        },
        {
          orderId: 'DAIK-DEF456',
          network: 'Telecel',
          bundle: '10GB',
          price: 'GH₵52.00',
          status: 'Pending',
          date: '2025-01-20'
        }
      ];
      
      displayCustomerOrders(mockOrders);
    }, 1500);
    
  } catch (error) {
    console.error('❌ Error loading customer orders:', error);
  }
}

function displayCustomerOrders(orders) {
  const ordersList = document.getElementById('customerOrdersList');
  
  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="no-orders">
        <i class="fas fa-inbox"></i>
        <h3>No Orders Yet</h3>
        <p>Start ordering data packages to see them here!</p>
        <button onclick="openQuickOrderModal()" class="btn btn-primary">
          Order Now
        </button>
      </div>
    `;
    return;
  }
  
  const ordersHTML = orders.map(order => `
    <div class="order-item ${order.status.toLowerCase()}">
      <div class="order-header">
        <span class="order-id">${order.orderId}</span>
        <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
      </div>
      <div class="order-details">
        <div class="order-info">
          <span class="network">${order.network}</span>
          <span class="bundle">${order.bundle}</span>
          <span class="price">${order.price}</span>
        </div>
        <div class="order-date">
          <i class="fas fa-calendar"></i> ${order.date}
        </div>
      </div>
    </div>
  `).join('');
  
  ordersList.innerHTML = ordersHTML;
}

// Support Functions
function openWhatsAppSupport() {
  const message = `🆘 Hi! I need help with my Daik Media order.`;
  const whatsappURL = `https://wa.me/233557574477?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
  console.log('📱 Opening WhatsApp support');
}

function openTelegramSupport() {
  window.open('https://t.me/DaikMedia', '_blank');
  console.log('📢 Opening Telegram support');
}

// Enhanced Quick Order with Payment Integration
function enhanceQuickOrderWithPayment(orderData) {
  // Add payment processing logic here
  console.log('💳 Processing payment for order:', orderData);
  
  // For now, simulate successful payment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, paymentId: 'PAY-' + Date.now() });
    }, 2000);
  });
}

// Performance Optimization
function optimizePagePerformance() {
  // Lazy load images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
  
  // Preload critical resources
  const criticalResources = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = 'style';
    document.head.appendChild(link);
  });
  
  console.log('⚡ Page performance optimized');
}

// Initialize Phase 4 features
document.addEventListener('DOMContentLoaded', function() {
  // Add customer dashboard button to navigation
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    const dashboardItem = document.createElement('li');
    dashboardItem.className = 'nav-item';
    dashboardItem.innerHTML = `
      <button onclick="openCustomerDashboard()" class="nav-link dashboard-btn">
        <i class="fas fa-user-circle"></i> Dashboard
      </button>
    `;
    navMenu.appendChild(dashboardItem);
  }
  
  // Optimize performance
  optimizePagePerformance();
  
  console.log('🚀 Phase 4: Advanced Features initialized');
});

console.log('🚀 Phase 4: Advanced Features & Production Polish loaded');
