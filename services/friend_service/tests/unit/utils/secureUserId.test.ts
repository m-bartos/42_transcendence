import { encryptUserId, decryptUserId } from '../../../src/utils/secureUserId';

describe('secureUserId utilities', () => {
  it('should encrypt and decrypt a userId correctly', () => {
    const userId = 'user123';
    const encrypted = encryptUserId(userId);
    expect(encrypted).not.toBe(userId);
    const decrypted = decryptUserId(encrypted);
    expect(decrypted).toBe(userId);
  });

  it('should throw when decrypting invalid data', () => {
    const invalid = 'invaliddata';
    expect(() => decryptUserId(invalid)).toThrow();
  });
});