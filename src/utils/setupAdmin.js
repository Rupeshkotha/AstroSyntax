const admin = require('firebase-admin');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/admin');

// Initialize Firebase Admin
// const serviceAccount = require('../../firebase-service-account.json');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Only one declaration of setupAdminAccount should exist
async function setupAdminAccount() {
  try {
    // Create the admin user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      emailVerified: true
    });
    console.log('Admin user created successfully!');

    // Set the admin role in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      isAdmin: true,
      email: ADMIN_EMAIL
    });
    console.log('Admin role set up successfully!');

    return true;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists. Setting up admin role...');
      // If the user already exists, get the user and set up the admin role
      const userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        isAdmin: true,
        email: ADMIN_EMAIL
      });
      console.log('Admin role set up successfully!');
      return true;
    }
    console.error('Error setting up admin account:', error);
    throw error;
  }
}

module.exports = { setupAdminAccount }; 