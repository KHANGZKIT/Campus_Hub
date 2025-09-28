import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL || 'admin@campus.local';  
const password = process.env.ADMIN_PASSWORD || 'campus';   

async function main() {
    if (!email || !password) {
        throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD env variables');
    }


    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: { name: 'admin' },
    });

    await prisma.role.upsert({ where: { name: 'staff' }, update: {}, create: { name: 'staff' } });
    await prisma.role.upsert({ where: { name: 'student' }, update: {}, create: { name: 'student' } });

 
    const passwordHash = await bcrypt.hash(password, 10);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma.user.create({
            data: { email, passwordHash, fullName: 'Administrator' },
        });
    } else {
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });
    }

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
        update: {},
        create: { userId: user.id, roleId: adminRole.id },
    });

    console.log(`✅ Bootstrap admin OK: ${email}`);
}

main()
    .catch((e) => {
        console.error('Bootstrap admin failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
