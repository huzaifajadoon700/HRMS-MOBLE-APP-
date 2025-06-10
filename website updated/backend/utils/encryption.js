const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-32-chars-long!!';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function encryptOrderData(orderData) {
  const sensitiveFields = ['paymentId', 'cardNumber', 'cvv'];
  const encryptedData = { ...orderData };

  sensitiveFields.forEach(field => {
    if (encryptedData[field]) {
      encryptedData[field] = encrypt(encryptedData[field]);
    }
  });

  return encryptedData;
}

function decryptOrderData(orderData) {
  const sensitiveFields = ['paymentId', 'cardNumber', 'cvv'];
  const decryptedData = { ...orderData };

  sensitiveFields.forEach(field => {
    if (decryptedData[field]) {
      decryptedData[field] = decrypt(decryptedData[field]);
    }
  });

  return decryptedData;
}

module.exports = {
  encrypt,
  decrypt,
  encryptOrderData,
  decryptOrderData
}; 