import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET as string,
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  accessExpiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || '15m') as string,
  refreshExpiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as string,
};

