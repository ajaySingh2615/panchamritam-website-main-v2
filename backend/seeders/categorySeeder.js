const { pool } = require('../config/db');

const categories = [
  { name: 'Fruits & Vegetables' },
  { name: 'Dairy & Eggs' },
  { name: 'Meat & Seafood' },
  { name: 'Bakery' },
  { name: 'Pantry Items' },
  { name: 'Beverages' },
  { name: 'Snacks' },
  { name: 'Personal Care' },
  { name: 'Household' },
  { name: 'Frozen Foods' }
];

const seedCategories = async () => {
  try {
    console.log('Starting category seeder...');
    
    // Check if categories already exist
    const [existingCategories] = await pool.execute('SELECT COUNT(*) as count FROM Categories');
    
    if (existingCategories[0].count > 0) {
      console.log(`${existingCategories[0].count} categories already exist, skipping seeding.`);
      return;
    }
    
    // Insert categories
    for (const category of categories) {
      await pool.execute(
        'INSERT INTO Categories (name) VALUES (?)',
        [category.name]
      );
      console.log(`Category "${category.name}" created successfully.`);
    }
    
    console.log('Category seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Execute if run directly (node seeders/categorySeeder.js)
if (require.main === module) {
  seedCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Category seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedCategories; 