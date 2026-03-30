import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateToken = (userId, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (
  userId,
  expiresIn = process.env.JWT_REFRESH_EXPIRE || '30d'
) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || '30d',
    { expiresIn }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || '30d');
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetTokenHash = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};
