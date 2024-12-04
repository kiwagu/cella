import { sign, verify } from 'hono/jwt';
import { env } from '../../../../env';

const secretKey = env.UNSUBSCRIBE_TOKEN_SECRET;

// Generate an unsubscribe token
export const generateUnsubscribeToken = async (email: string): Promise<string> => {
  const token = await sign({ email }, secretKey, 'HS256');
  return token;
};

// Verify an unsubscribe token
export const verifyUnsubscribeToken = async (email: string, token: string): Promise<boolean> => {
  try {
    const payload = await verify(token, secretKey, 'HS256');

    // Check if the email matches the payload
    return payload.email === email;
  } catch (err) {
    // Invalid token
    return false;
  }
};