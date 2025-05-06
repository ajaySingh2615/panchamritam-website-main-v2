const { pool } = require('../config/db');

const products = [
  {
    name: 'Organic Bananas',
    description: 'Fresh organic bananas sourced from local farms',
    price: 2.99,
    quantity: 100,
    category_id: 1, // Fruits & Vegetables
    image_url: 'https://example.com/images/bananas.jpg',
    created_by: 1 // admin user
  },
  {
    name: 'Fresh Milk',
    description: 'Pasteurized whole milk from grass-fed cows',
    price: 3.49,
    quantity: 50,
    category_id: 2, // Dairy & Eggs
    image_url: 'https://example.com/images/milk.jpg',
    created_by: 1
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread',
    price: 2.49,
    quantity: 30,
    category_id: 4, // Bakery
    image_url: 'https://example.com/images/bread.jpg',
    created_by: 1
  },
  {
    name: 'Chicken Breast',
    description: 'Boneless, skinless chicken breast',
    price: 5.99,
    quantity: 40,
    category_id: 3, // Meat & Seafood
    image_url: 'https://example.com/images/chicken.jpg',
    created_by: 1
  },
  {
    name: 'Organic Honey',
    description: 'Pure, organic honey from local beekeepers',
    price: 7.99,
    quantity: 25,
    category_id: 5, // Pantry Items
    image_url: 'https://example.com/images/honey.jpg',
    created_by: 1
  }
];

const seedProducts = async () => {
  try {
    console.log('Starting product seeder...');
    
    // Check if products already exist
    const [existingProducts] = await pool.execute('SELECT COUNT(*) as count FROM Products');
    
    if (existingProducts[0].count > 0) {
      console.log(`${existingProducts[0].count} products already exist, skipping seeding.`);
      return;
    }
    
    // Insert products
    for (const product of products) {
      await pool.execute(
        `INSERT INTO Products 
         (name, description, price, quantity, category_id, image_url, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.description,
          product.price,
          product.quantity,
          product.category_id,
          product.image_url,
          product.created_by
        ]
      );
      console.log(`Product "${product.name}" created successfully.`);
    }
    
    console.log('Product seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

// Execute if run directly (node seeders/productSeeder.js)
if (require.main === module) {
  seedProducts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Product seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedProducts; 