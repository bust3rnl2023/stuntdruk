import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'stuntdruk-custom-jwt-secret-key-2026';

// 1. Password Hashing Utility (PBKDF2)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function comparePassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    const checkHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === checkHash;
  } catch {
    return false;
  }
}

// 2. Custom JWT Sign & Verify Utilities
export function generateToken(payload: { id: number; uid: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ 
    ...payload, 
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days expiration
  })).toString('base64url');
  
  const signatureInput = `${header}.${body}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(signatureInput).digest('base64url');
  
  return `${signatureInput}.${signature}`;
}

export function verifyToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, bodyB64, signature] = parts;
    const signatureInput = `${headerB64}.${bodyB64}`;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(signatureInput).digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    uid: string;
    email: string;
  };
}

// 3. Hybrid Authorization Middleware (Custom HTTP JWT and Firebase ID Token handler)
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // A. Check if it's a Custom JWT token first
  const customPayload = verifyToken(token);
  if (customPayload) {
    try {
      const dbUser = await db.select().from(users).where(eq(users.id, customPayload.id)).limit(1);
      if (dbUser.length === 0) {
        return res.status(401).json({ error: 'Unauthorized: User not found in database' });
      }
      req.user = {
        id: dbUser[0].id,
        uid: dbUser[0].uid,
        email: dbUser[0].email,
      };
      return next();
    } catch (err) {
      console.error('Error fetching database user for custom token:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // B. Fallback to verifying Firebase ID token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email } = decodedToken;
    
    if (!email) {
      return res.status(401).json({ error: 'Unauthorized: Missing email in token' });
    }

    // Get or Create user in Postgres
    const result = await db.insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    const dbUser = result[0];
    req.user = {
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
