// Bu dosyadaki tüm fonksiyonlar sadece server-side'da çalışır
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * String'i hash'ler (bcrypt)
 */
export async function hashString(str: string): Promise<string> {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(str, saltRounds);
  } catch (error) {
    console.error('Hash oluşturma hatası:', error);
    throw new Error('Hash oluşturulamadı');
  }
}

/**
 * Hash'lenmiş string'i doğrular
 */
export async function verifyHashString(
  str: string,
  hashedStr: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(str, hashedStr);
  } catch (error) {
    console.error('Hash doğrulama hatası:', error);
    return false;
  }
}

/**
 * Rastgele string oluşturur
 */
export function generateRandomString(length: number = 32): string {
  try {
    return crypto.randomBytes(length).toString("base64url");
  } catch (error) {
    console.error('Rastgele string oluşturma hatası:', error);
    // Fallback
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

/**
 * PBKDF2 ile hash oluşturur
 */
export function pbkdf2Hash(text: string): string {
  try {
    const salt = process.env.HASH_SALT_KEY || 'default-salt-change-this-in-production';
    return crypto.pbkdf2Sync(text, salt, 10000, 64, "sha256").toString("hex");
  } catch (error) {
    console.error('PBKDF2 hash oluşturma hatası:', error);
    throw new Error('Hash oluşturulamadı');
  }
}

/**
 * PBKDF2 hash'ini doğrular
 */
export function pbkdf2Verify(text: string, hash: string): boolean {
  try {
    const computedHash = pbkdf2Hash(text);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(hash, "hex")
    );
  } catch (error) {
    console.error('PBKDF2 doğrulama hatası:', error);
    return false;
  }
}

/**
 * 6 haneli doğrulama kodu oluşturur
 */
export function generateVerificationCode(): string {
  try {
    return crypto.randomInt(100000, 1000000).toString();
  } catch (error) {
    console.error('Doğrulama kodu oluşturma hatası:', error);
    // Fallback
    return Math.floor(Math.random() * 900000 + 100000).toString();
  }
}

/**
 * Güvenli UUID oluşturur
 */
export function generateUUID(): string {
  try {
    return crypto.randomUUID();
  } catch (error) {
    console.error('UUID oluşturma hatası:', error);
    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * API key oluşturur
 */
export function generateApiKey(): string {
  return `xbot_${generateRandomString(32)}`;
}

/**
 * Güvenli token oluşturur
 */
export function generateSecureToken(length: number = 32): string {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    console.error('Güvenli token oluşturma hatası:', error);
    return generateRandomString(length);
  }
}