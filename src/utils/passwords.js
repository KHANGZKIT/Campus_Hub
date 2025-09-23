import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

export function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
