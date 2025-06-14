const { setupAdminAccount } = require('../utils/setupAdmin');

// Run the admin setup
setupAdminAccount()
  .then(() => {
    console.log('Admin setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Admin setup failed:', error);
    process.exit(1);
  }); 