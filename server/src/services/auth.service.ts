import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import User, { UserRole } from '../models/user';
import RefreshToken from '../models/refreshToken';
import { Op } from 'sequelize';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async signup(
    fullName: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<User> {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      full_name: fullName,
      email,
      password_hash: passwordHash,
      role,
    });

    return user;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const tokens = await this.generateTokenPair(user);

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as {
        id: string;
        tokenId: string;
      };

      const tokenRecord = await RefreshToken.findOne({
        where: {
          id: decoded.tokenId,
          user_id: decoded.id,
          expires_at: { [Op.gt]: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new Error('Invalid or expired refresh token');
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      await tokenRecord.destroy();

      return await this.generateTokenPair(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as {
        id: string;
        tokenId: string;
      };

      await RefreshToken.destroy({
        where: {
          id: decoded.tokenId,
          user_id: decoded.id,
        },
      });
    } catch (error) {
      // Ignore logout errors
    }
  }

  private async generateTokenPair(user: User): Promise<TokenPair> {
    // @ts-expect-error - expiresIn accepts string values like '15m', '7d'
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtConfig.accessSecret,
      { expiresIn: jwtConfig.accessExpiresIn }
    );

    const refreshTokenRecord = await RefreshToken.create({
      user_id: user.id,
      token: '',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // @ts-expect-error - expiresIn accepts string values like '15m', '7d'
    const refreshToken = jwt.sign(
      {
        id: user.id,
        tokenId: refreshTokenRecord.id,
      },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    );

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await refreshTokenRecord.update({ token: hashedToken });

    return { accessToken, refreshToken };
  }
}

