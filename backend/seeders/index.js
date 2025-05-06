const seedRoles = require('./roleSeeder');
const seedAdmin = require('./adminSeeder');
const seedCategories = require('./categorySeeder');
const seedProducts = require('./productSeeder');

/**
 * Run all seeders in sequence
 */
const runSeeders = async () => {
  try {
    console.log('Running all seeders...');
    
    // Run each seeder in sequence
    await seedRoles();
    await seedAdmin();
    await seedCategories();
    await seedProducts();
    
    console.log('All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders; 