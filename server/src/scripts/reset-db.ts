import dotenv from 'dotenv';
import sequelize from '../config/db';
import '../models'; // Import models to register them
import logger from '../utils/logger';

dotenv.config();

async function resetDatabase() {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established.');

    logger.warn('Resetting database (dropping all tables)...');
    
    // Sync with force: true - drops all tables and recreates them
    await sequelize.sync({ force: true });
    
    logger.info('Database reset successfully!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error resetting database:', error);
    await sequelize.close();
    process.exit(1);
  }
}

resetDatabase();

