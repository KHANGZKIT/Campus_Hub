import { PrismaClient } from "@prisma/client";

//Tao client de ket noi voi database
const prisma = new PrismaClient();

async function main() {
    for (const name of ['admin', 'staff', 'student']) {
        await prisma.role.upsert({
            where: { name }, //tim role theo name
            update: {}, // neu tim thay thi ko doi
            create: { name } // neu chua co thi tao moi 
        });
    }
    console.log('Seed roles');
}

main().finally(() => 
    prisma.$disconnect() //Thuc thi ham main
);