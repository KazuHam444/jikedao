const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const PREFIX = 'ENC:';

function getKey() {
  const keyMaterial = process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET || null;
  if (!keyMaterial) return null;
  // Derive 32-byte key deterministically from provided secret
  return crypto.createHash('sha256').update(String(keyMaterial)).digest();
}

function encrypt(plain) {
  if (!plain && plain !== '') return plain;
  const key = getKey();
  if (!key) throw new Error('DATA_ENCRYPTION_KEY 未配置，无法加密');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: 16 });
  const ciphertext = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`;
}

function decrypt(value) {
  if (!value) return value;
  if (!String(value).startsWith(PREFIX)) return value; // already plaintext or not encrypted
  const key = getKey();
  if (!key) throw new Error('DATA_ENCRYPTION_KEY 未配置，无法解密');
  const payload = String(value).slice(PREFIX.length);
  const parts = payload.split(':');
  if (parts.length !== 3) throw new Error('加密数据格式不正确');
  const iv = Buffer.from(parts[0], 'base64');
  const tag = Buffer.from(parts[1], 'base64');
  const ciphertext = Buffer.from(parts[2], 'base64');
  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = {
  encrypt,
  decrypt,
  isEncrypted: (v) => typeof v === 'string' && v.startsWith(PREFIX)
};
