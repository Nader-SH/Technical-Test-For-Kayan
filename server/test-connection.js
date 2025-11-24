const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
});

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully!');
    
    // Test query
    const [results] = await sequelize.query('SELECT version(), current_database();');
    console.log('\n📊 Database Info:');
    console.log('Database:', results[0].current_database);
    console.log('Version:', results[0].version);
    
    // Check tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    await sequelize.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

testConnection();

