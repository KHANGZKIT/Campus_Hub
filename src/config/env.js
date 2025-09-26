// src/config/env.js
import 'dotenv/config';

const config = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 5000),
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
    databaseUrl: process.env.DATABASE_URL,
};

export default config;
