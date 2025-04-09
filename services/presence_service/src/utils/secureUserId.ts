import * as crypto from "node:crypto";

// Shared secret key (32 bytes for AES-256)
const sharedKey = Buffer.from('12345678901234567890123456789012'); // Must be 32 bytes for AES-256

// Function to encrypt userId
export function encryptUserId(userId: string) {
    const iv = crypto.randomBytes(12); // Initialization Vector (12 bytes for GCM)
    const cipher = crypto.createCipheriv('aes-256-gcm', sharedKey, iv);

    let encrypted = cipher.update(userId, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag(); // Authentication tag for integrity

    // Combine IV, encrypted data, and auth tag into a single string
    return iv.toString('hex') + encrypted + authTag.toString('hex');
}

// Function to decrypt userId
export function decryptUserId(encryptedData: string) {
    const iv = Buffer.from(encryptedData.slice(0, 24), 'hex'); // First 12 bytes (24 hex chars)
    const encrypted = encryptedData.slice(24, -32); // Encrypted data (excluding IV and tag)
    const authTag = Buffer.from(encryptedData.slice(-32), 'hex'); // Last 16 bytes (32 hex chars)

    const decipher = crypto.createDecipheriv('aes-256-gcm', sharedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}