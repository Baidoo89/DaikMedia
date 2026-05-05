// Firebase Authentication System for Daik Media Wallet
// This file handles user authentication and session management

// Firebase configuration - Your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAec9LvndwGjjYLWK5Vclziv_dA_FBPAOM",
  authDomain: "daik-media-data-bundles.firebaseapp.com",
  projectId: "daik-media-data-bundles",
  storageBucket: "daik-media-data-bundles.firebasestorage.app",
  messagingSenderId: "1065539358238",
  appId: "1:1065539358238:web:1ce99e8d4a644ddbf1280f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// User state management
let currentUser = null;
let userWalletData = null;

// Check if user is already logged in
auth.onAuthStateChanged(function(user) {
  try {
    if (user) {
      // User is signed in
      currentUser = user;
      loadUserWalletData();
    } else {
      // User is signed out
      currentUser = null;
      userWalletData = null;
    }
  } catch (error) {
    console.error('❌ Error in auth state change:', error);
    currentUser = null;
    userWalletData = null;
  }
});

// Sign up function
async function signUp(email, password, name, phone) {
  try {
    // Create user account
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Validate userCredential before destructuring
    if (!userCredential || !userCredential.user) {
      throw new Error('Failed to create user account. Please try again.');
    }
    
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      email: email,
      name: name,
      phone: phone,
      createdAt: new Date(),
      walletBalance: 0,
      lastLogin: new Date()
    });
    
    // Initialize wallet data
    await initializeUserWallet(user.uid);
    
    return { success: true, user: user };
    
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return { success: false, error: error.message || 'Account creation failed' };
  }
}

// Sign in function
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Validate userCredential before destructuring
    if (!userCredential || !userCredential.user) {
      throw new Error('Failed to sign in. Please try again.');
    }
    
    const user = userCredential.user;
    
    // Update last login
    await db.collection('users').doc(user.uid).update({
      lastLogin: new Date()
    });
    
    return { success: true, user: user };
    
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { success: false, error: error.message || 'Sign in failed' };
  }
}

// Sign out function
async function signOut() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Password reset function
async function sendPasswordResetEmail(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset error:', error);
    return { success: false, error: error.message };
  }
}

// Initialize user wallet
async function initializeUserWallet(userId) {
  try {
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();
    
    if (!walletDoc.exists) {
      // Create new wallet
      await walletRef.set({
        balance: 0,
        transactions: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('❌ Initialize wallet error:', error);
    throw error;
  }
}

// Load user wallet data
async function loadUserWalletData() {
  if (!currentUser) return;
  
  try {
    const walletRef = db.collection('wallets').doc(currentUser.uid);
    const walletDoc = await walletRef.get();
    
    if (walletDoc.exists) {
      userWalletData = walletDoc.data();
    } else {
      // Initialize new wallet if it doesn't exist
      await initializeUserWallet(currentUser.uid);
      userWalletData = { balance: 0, transactions: [] };
    }
  } catch (error) {
    console.error('❌ Load wallet data error:', error);
    userWalletData = { balance: 0, transactions: [] };
  }
}

// Add money to wallet (Firebase version)
async function addToWalletFirebase(amount, method) {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  try {
    const walletRef = db.collection('wallets').doc(currentUser.uid);
    
    // Create transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'credit',
      amount: amount,
      method: method,
      date: new Date(),
      description: `Wallet top-up via ${method}`,
      reference: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Get current wallet data first
    const walletDoc = await walletRef.get();
    const currentBalance = walletDoc.exists ? (walletDoc.data().balance || 0) : 0;
    const newBalance = currentBalance + amount;
    
    // Get current transactions
    const currentTransactions = walletDoc.exists ? (walletDoc.data().transactions || []) : [];
    const updatedTransactions = [...currentTransactions, transaction];
    
    // Upsert wallet in Firestore (merge to avoid missing-doc errors)
    await walletRef.set({
      balance: newBalance,
      transactions: updatedTransactions,
      lastUpdated: new Date()
    }, { merge: true });
    
    // Reload wallet data
    await loadUserWalletData();
    
    return { success: true, transaction: transaction };
    
  } catch (error) {
    console.error('❌ Add to wallet error:', error);
    throw error;
  }
}

// Deduct money from wallet (Firebase version)
async function deductFromWalletFirebase(amount, description) {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  try {
    const walletRef = db.collection('wallets').doc(currentUser.uid);
    
    // Read latest balance directly from Firestore to avoid stale cache checks
    const walletDoc = await walletRef.get();
    const currentBalance = walletDoc.exists ? (walletDoc.data().balance || 0) : 0;
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'debit',
      amount: amount,
      method: 'Wallet',
      date: new Date(),
      description: description,
      reference: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Compute new state
    const newBalance = currentBalance - amount;
    const currentTransactions = walletDoc.exists ? (walletDoc.data().transactions || []) : [];
    const updatedTransactions = [...currentTransactions, transaction];
    
    // Upsert wallet in Firestore (merge to avoid missing-doc errors)
    await walletRef.set({
      balance: newBalance,
      transactions: updatedTransactions,
      lastUpdated: new Date()
    }, { merge: true });
    
    // Reload wallet data
    await loadUserWalletData();
    
    return { success: true, transaction: transaction };
    
  } catch (error) {
    console.error('❌ Deduct from wallet error:', error);
    throw error;
  }
}

// Get current user
function getCurrentUser() {
  return currentUser;
}

// Get user wallet data
function getUserWalletData() {
  return userWalletData;
}

// Check if user is authenticated
function isAuthenticated() {
  try {
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined' || !firebase.auth) {
      return false;
    }
    
    // Check both the local variable and Firebase auth state
    const firebaseUser = auth.currentUser;
    return currentUser !== null || firebaseUser !== null;
    
  } catch (error) {
    console.error('❌ Error in isAuthenticated:', error);
    return false;
  }
}

// Wait for Firebase auth to be ready
function waitForAuth() {
  return new Promise((resolve) => {
    if (auth.currentUser !== null || currentUser !== null) {
      resolve(true);
    } else {
      // Wait for auth state to change
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe(); // Unsubscribe after first change
        resolve(!!user);
      });
      
      // Timeout after 3 seconds
      setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, 3000);
    }
  });
}

// Export functions for use in other files
window.authFunctions = {
  signUp,
  signIn,
  signOut,
  logout: signOut,
  sendPasswordResetEmail,
  getCurrentUser,
  getUserWalletData,
  isAuthenticated,
  waitForAuth,
  addToWalletFirebase,
  deductFromWalletFirebase,
  loadUserWalletData,
  initializeUserWallet
};
