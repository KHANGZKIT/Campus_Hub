import { prisma } from '../db/client.js';

export async function grantRole(userId, roleName) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error('Role not found');
    await prisma.userRole.upsert({
        where: { userId_roleId: { userId, roleId: role.id } },
        update: {},
        create: { userId, roleId: role.id },
    });
}
export async function revokeRole(userId, roleName) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;
    await prisma.userRole.delete({
        where: { userId_roleId: { userId, roleId: role.id } },
    });
}
