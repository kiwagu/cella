import CryptoJS from 'crypto-js';
import { env } from '../../../../env';

// Function to get the secret key
const getCryptoSecret = (): string => {
  return env.ARGON_SECRET;
};

// Hash a password using HMAC-SHA256 with a secret and a salt
export const hashPassword = (password: string): string => {
  const secret = getCryptoSecret();
  // Generate a random salt (16 bytes)
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  // Combine the password and salt, then hash
  const hash = CryptoJS.HmacSHA256(password + salt, secret).toString();
  // Store both the salt and the hash, separated by a delimiter
  return `${salt}$${hash}`;
};

// Verify a password by recomputing the hash with the salt
export const verifyPassword = (storedHash: string, password: string): boolean => {
  const secret = getCryptoSecret();
  // Split the stored hash into salt and hash components
  const [salt, originalHash] = storedHash.split('$');
  if (!salt || !originalHash) {
    throw new Error('Invalid stored hash format');
  }
  // Recompute the hash using the same salt
  const newHash = CryptoJS.HmacSHA256(password + salt, secret).toString();
  // Compare the recomputed hash with the original hash
  return newHash === originalHash;
};