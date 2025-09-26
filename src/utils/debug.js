import crypto from 'node:crypto';
export const shortHash = (s) =>
    !s ? '∅' : crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);