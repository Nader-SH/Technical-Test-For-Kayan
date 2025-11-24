import dotenv from 'dotenv';
import app from './app';
import sequelize from './config/db';
import logger from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 4000;

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connection established successfully.');
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  });

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

