// Polyfill crypto.hash for Node < 22 (required by Vite 7)
const crypto = require('crypto');
if (typeof crypto.hash === 'undefined') {
  crypto.hash = (algorithm, data, outputEncoding = 'hex') => {
    return crypto.createHash(algorithm).update(data).digest(outputEncoding);
  };
}
