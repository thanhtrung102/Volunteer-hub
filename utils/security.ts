/**
 * Security Utilities for VolunteerHub
 * Implements password hashing, JWT tokens, and CSRF protection
 */

import { User } from '../types';

// Simulated bcrypt-style password hashing
// In production, use actual bcryptjs library
class PasswordHasher {
  private static readonly SALT_ROUNDS = 10;
  private static readonly HASH_PREFIX = '$2b$10$';

  /**
   * Hash a password using bcrypt-style algorithm
   * Note: This is a simulation for demonstration. In production, use bcryptjs.hash()
   */
  public static async hash(password: string): Promise<string> {
    // Simulate async hashing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simple simulation of bcrypt hash
    // Format: $2b$10$[22-char salt][31-char hash]
    const salt = this.generateSalt();
    const hash = await this.simpleHash(password + salt);
    return `${this.HASH_PREFIX}${salt}${hash}`;
  }

  /**
   * Compare a password with its hash
   */
  public static async compare(password: string, hash: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!hash || !hash.startsWith(this.HASH_PREFIX)) {
      return false;
    }

    // Extract salt from hash
    const hashParts = hash.substring(this.HASH_PREFIX.length);
    const salt = hashParts.substring(0, 22);
    const storedHash = hashParts.substring(22);

    // Re-hash password with extracted salt
    const computedHash = await this.simpleHash(password + salt);
    return computedHash === storedHash;
  }

  private static generateSalt(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';
    let salt = '';
    for (let i = 0; i < 22; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  }

  private static async simpleHash(input: string): Promise<string> {
    // Use Web Crypto API for actual hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 31); // bcrypt produces 31-char hash
  }
}

// JWT Token Implementation
interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;  // Issued at
  exp: number;  // Expiration
}

class JWT {
  private static readonly SECRET = 'volunteerhub-secret-key-change-in-production';
  private static readonly EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Sign a JWT token
   */
  public static sign(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + this.EXPIRY
    };

    // Encode header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    // Create signature (simplified - in production use crypto library)
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify and decode a JWT token
   */
  public static verify(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;

      // Verify signature
      const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);
      if (signature !== expectedSignature) {
        console.warn('[Security] Invalid JWT signature');
        return null;
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JWTPayload;

      // Check expiration
      if (payload.exp < Date.now()) {
        console.warn('[Security] JWT token expired');
        return null;
      }

      return payload;
    } catch (error) {
      console.error('[Security] JWT verification failed:', error);
      return null;
    }
  }

  private static base64UrlEncode(str: string): string {
    const base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    return atob(base64);
  }

  private static createSignature(data: string): string {
    // Simplified HMAC simulation
    // In production, use proper HMAC-SHA256
    const combined = data + this.SECRET;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// CSRF Protection
class CSRF {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly HEADER_NAME = 'X-CSRF-Token';

  /**
   * Generate a CSRF token
   */
  public static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Store in sessionStorage (cleared on tab close)
    sessionStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }

  /**
   * Get the current CSRF token
   */
  public static getToken(): string | null {
    let token = sessionStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      token = this.generateToken();
    }
    return token;
  }

  /**
   * Validate a CSRF token
   */
  public static validateToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    if (!storedToken) {
      console.warn('[Security] No CSRF token found in session');
      return false;
    }

    if (token !== storedToken) {
      console.warn('[Security] CSRF token mismatch');
      return false;
    }

    return true;
  }

  /**
   * Add CSRF token to request headers
   */
  public static addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers[this.HEADER_NAME] = token;
    }
    return headers;
  }

  /**
   * Clear CSRF token
   */
  public static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}

// HTTPS Enforcement
class HTTPSEnforcer {
  /**
   * Check if connection is secure
   */
  public static isSecure(): boolean {
    return window.location.protocol === 'https:' ||
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Enforce HTTPS (redirect if not secure)
   */
  public static enforce(): void {
    if (!this.isSecure() &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1') {
      console.warn('[Security] Redirecting to HTTPS');
      window.location.href = window.location.href.replace('http://', 'https://');
    }
  }

  /**
   * Get security status
   */
  public static getStatus(): {
    isSecure: boolean;
    protocol: string;
    recommendation: string;
  } {
    const isSecure = this.isSecure();
    return {
      isSecure,
      protocol: window.location.protocol,
      recommendation: isSecure
        ? 'Connection is secure'
        : 'Warning: Insecure connection. Use HTTPS in production.'
    };
  }
}

// Password Strength Validator
class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly PATTERNS = {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/
  };

  public static validate(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters`);
    } else {
      score++;
    }

    if (!this.PATTERNS.lowercase.test(password)) {
      errors.push('Password must contain lowercase letters');
    } else {
      score++;
    }

    if (!this.PATTERNS.uppercase.test(password)) {
      errors.push('Password must contain uppercase letters');
    } else {
      score++;
    }

    if (!this.PATTERNS.number.test(password)) {
      errors.push('Password must contain numbers');
    } else {
      score++;
    }

    if (!this.PATTERNS.special.test(password)) {
      errors.push('Password must contain special characters');
    } else {
      score++;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      isValid: errors.length === 0,
      strength,
      errors
    };
  }
}

// Input Sanitization
class Sanitizer {
  /**
   * Sanitize HTML to prevent XSS
   */
  public static sanitizeHTML(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Sanitize SQL input (for demonstration)
   */
  public static sanitizeSQL(input: string): string {
    return input.replace(/['";\\]/g, '');
  }

  /**
   * Validate email format
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export all security utilities
export {
  PasswordHasher,
  JWT,
  CSRF,
  HTTPSEnforcer,
  PasswordValidator,
  Sanitizer
};
