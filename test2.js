require('dotenv').config({path: '.env.local'});
const rawKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY || '';
let key = rawKey;
try { const parsed = JSON.parse(key); if (parsed.private_key) key = parsed.private_key; } catch(e) {}
key = key.replace(/^"|"$/g, '');
key = key.replace(/^'|'$/g, '');
key = key.replace(/\\n/g, '\n');
if (!key.includes('BEGIN PRIVATE KEY')) key = '-----BEGIN PRIVATE KEY-----\n' + key + '\n-----END PRIVATE KEY-----\n';
console.log('Final Key Length:', key.length);
console.log('Starts with:', key.substring(0, 30).replace(/\n/g, '\\n'));
console.log('Ends with:', key.substring(key.length - 30).replace(/\n/g, '\\n'));

const crypto = require('crypto');
try {
  crypto.createPrivateKey(key);
  console.log('OK!');
} catch(e) {
  console.log('ERROR:', e.message);
}
