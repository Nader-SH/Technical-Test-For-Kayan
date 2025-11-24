import dotenv from 'dotenv';
import sequelize from '../config/db';
import '../models'; // Import models to register them
import logger from '../utils/logger';

dotenv.config();

async function buildDatabase() {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established.');

    logger.info('Building database schema...');
    
    // Sync all models (create tables if they don't exist)
    // force: false - don't drop existing tables
    // alter: true - alter tables to match models (add/remove columns)
    await sequelize.sync({ force: false, alter: true });
    
    logger.info('Database schema built successfully!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error building database:', error);
    await sequelize.close();
    process.exit(1);
  }
}

buildDatabase();

