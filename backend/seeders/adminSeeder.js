const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const adminUser = {
  name: 'Admin User',
  email: 'admin@greenmagic.com',
  password: 'admin123'  // This will be hashed before storage
};

const seedAdmin = async () => {
  try {
    console.log('Starting admin user seeder...');
    
    // Check if admin user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?', 
      [adminUser.email]
    );
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists, skipping seeding.');
      return;
    }
    
    // Get admin role id
    const [adminRoles] = await pool.execute(
      'SELECT role_id FROM Roles WHERE role_name = ?', 
      ['admin']
    );
    
    if (adminRoles.length === 0) {
      console.error('Admin role not found. Please run role seeder first.');
      return;
    }
    
    const adminRoleId = adminRoles[0].role_id;
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds);
    
    // Insert admin user
    await pool.execute(
      'INSERT INTO Users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [adminUser.name, adminUser.email, hashedPassword, adminRoleId]
    );
    
    console.log(`Admin user "${adminUser.email}" created successfully.`);
    console.log('Admin seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Execute if run directly (node seeders/adminSeeder.js)
if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Admin seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAdmin; 