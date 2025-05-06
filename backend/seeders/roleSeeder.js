const { pool } = require('../config/db');

const roles = [
  { name: 'admin' },
  { name: 'user' }
];

const seedRoles = async () => {
  try {
    console.log('Starting role seeder...');
    
    // Check if roles already exist
    const [existingRoles] = await pool.execute('SELECT * FROM Roles');
    
    if (existingRoles.length > 0) {
      console.log('Roles already exist, skipping seeding.');
      return;
    }
    
    // Insert roles
    for (const role of roles) {
      await pool.execute(
        'INSERT INTO Roles (role_name) VALUES (?)',
        [role.name]
      );
      console.log(`Role "${role.name}" created successfully.`);
    }
    
    console.log('Role seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding roles:', error);
  }
};

// Execute if run directly (node seeders/roleSeeder.js)
if (require.main === module) {
  seedRoles()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedRoles;