// Homepage JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
  
  // Close mobile menu when clicking on a link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
  
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
      }
    });
  });
  
  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(102, 126, 234, 0.95)';
      navbar.style.backdropFilter = 'blur(10px)';
    } else {
      navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      navbar.style.backdropFilter = 'none';
    }
  });
  
  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animateElements = document.querySelectorAll('.feature-card, .service-card, .package-card');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Services Page Tab Functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const networkPackages = document.querySelectorAll('.network-packages');

  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const network = button.dataset.network;
        console.log('Tab clicked:', network); // Debug log
        
        // Remove active class from all buttons and sections
        tabButtons.forEach(btn => btn.classList.remove('active'));
        networkPackages.forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked button and corresponding section
        button.classList.add('active');
        const targetSection = document.getElementById(network);
        console.log('Target section:', targetSection); // Debug log
        
        if (targetSection) {
          targetSection.classList.add('active');
          console.log('Section activated:', network); // Debug log
        } else {
          console.error('Section not found for network:', network); // Debug log
        }
      });
    });
  }





  // Quick Order Form Submission
  if (quickOrderForm) {
    quickOrderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('quickName').value.trim();
      const number = document.getElementById('quickNumber').value.trim();
      const bundle = document.getElementById('quickBundle').value;
      const payment = document.getElementById('quickPayment').value;
      const notes = document.getElementById('quickNotes').value.trim();

      // Validate required fields
      if (!name || !number || !bundle || !payment) {
        alert("Please fill in all required fields.");
        return;
      }

      // Validate phone number format (basic check)
      if (number.length < 10 || number.length > 15) {
        alert("Please enter a valid phone number.");
        return;
      }

      // Create WhatsApp message
      const message = `🆕 NEW DATA ORDER RECEIVED! 📱

👤 Customer Name: ${name}
📞 Phone Number: ${number}
📦 Data Bundle: ${bundle}
💳 Payment Method: ${payment}
📝 Notes: ${notes || 'None'}

⏰ Order Time: ${new Date().toLocaleString()}`;
      
      // Telegram Bot Notification
      const telegramBotToken = "8294234733:AAHEmg-VGJoD4_y0xOmqHDJLmHX0RylQqfc";
      const chatId = "Id- 615245748";
      
      const telegramMessage = `📦 *New Order Received*

👤 Name: ${name}
📱 Number: ${number}
💼 Bundle: ${bundle}
💰 Payment: ${payment}
📝 Notes: ${notes || 'None'}
⏰ Time: ${new Date().toLocaleString()}`;

      const telegramURL = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      
      // Send Telegram notification
      fetch(telegramURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
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

      // Try to save to Google Sheets
      const scriptURL = "https://script.google.com/macros/s/AKfycbzuFDTosabmYvMFlZxSyvp-LmRR09eKFiEUDWA1WlEP5cCPgPoTh82vG4vmsjBb9RypeQ/exec";
      
      const formData = new FormData();
      formData.append('action', 'saveorder');  // Add this line!
      formData.append('name', name);
      formData.append('number', number);
      formData.append('bundle', bundle);
      formData.append('payment', payment);
      formData.append('notes', notes);

      fetch(scriptURL, {
        method: "POST",
        body: formData,
      })
      .then(res => {
        if (res.ok) {
          console.log("Data saved to Google Sheets successfully");
          showSuccessMessage(message, true, true);
        } else {
          console.log("Google Sheets error:", res.status);
          showSuccessMessage(message, false, true);
        }
        return res.json();
      })
      .catch(error => {
        console.error("Google Sheets Error:", error.message);
        showSuccessMessage(message, false, true);
      })
      .finally(() => {
        // Close modal and reset form
        if (modal) {
          modal.style.display = 'none';
        }
        quickOrderForm.reset();
      });
    });
  }

  // FAQ Functionality
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Close all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      item.classList.toggle('active');
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value.trim();

      // Validate required fields
      if (!name || !email || !subject || !message) {
        alert("Please fill in all required fields.");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Show loading
      const submitButton = contactForm.querySelector('.btn');
      const btnText = submitButton.querySelector('.btn-text');
      const loading = submitButton.querySelector('.loading');
      
      btnText.style.display = 'none';
      loading.style.display = 'inline-block';
      submitButton.disabled = true;

      // Create contact message
      const contactMessage = `📧 *New Contact Form Submission*

👤 Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone || 'Not provided'}
📋 Subject: ${subject}
💬 Message: ${message}

⏰ Time: ${new Date().toLocaleString()}`;

      // Send Telegram notification
      const telegramBotToken = "8427904139:AAGo8Io1YmTGz7SIQxd0Emam9rEU__iR1SM";
      const chatId = "7271153158";
      
      const telegramURL = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      
      fetch(telegramURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: contactMessage,
          parse_mode: "Markdown"
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Contact form Telegram notification sent:", data);
      })
      .catch(error => {
        console.error("Contact form Telegram notification error:", error);
      });

      // Show success message
      setTimeout(() => {
        alert("Thank you for your message! We'll get back to you soon.");
        contactForm.reset();
        
        // Reset button
        btnText.style.display = 'inline';
        loading.style.display = 'none';
        submitButton.disabled = false;
      }, 1000);
    });
  }
});

// Function to show success message and WhatsApp button
function showSuccessMessage(message, googleSheetsSuccess, telegramSent = false) {
  const whatsappURL = "https://wa.me/233557574477?text=" + encodeURIComponent(message);
  
  const successDiv = document.createElement('div');
  successDiv.className = 'success-popup';
  
  successDiv.innerHTML = `
    <h3>✅ Order Submitted Successfully!</h3>
    <p>Your order has been received and will be processed shortly. We'll contact you soon!</p>
    <button onclick="sendOrderToWhatsApp('${whatsappURL}')" class="popup-btn whatsapp-btn">
      📱 Send Order to WhatsApp
    </button>
    <button onclick="closeSuccessMessage()" class="popup-btn close-btn">
      Close
    </button>
    <div class="status-text">
      ${googleSheetsSuccess ? '📊 Data saved to Google Sheets' : '⚠️ Data backup failed'}
      ${telegramSent ? '<br>📱 Telegram notification sent' : ''}
    </div>
  `;
  
  document.body.appendChild(successDiv);
}

// Function to send order to WhatsApp
function sendOrderToWhatsApp(whatsappURL) {
  window.open(whatsappURL, "_blank");
}

// Function to close success message
function closeSuccessMessage() {
  const successDiv = document.querySelector('.success-popup');
  if (successDiv) {
    document.body.removeChild(successDiv);
  }

} 
