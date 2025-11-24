import dotenv from 'dotenv';
import sequelize from '../config/db';
import '../models';
import logger from '../utils/logger';

dotenv.config();

async function buildDatabase() {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established.');

    logger.info('Building database schema...');
    
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

