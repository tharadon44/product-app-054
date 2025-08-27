import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as {
    prisma:PrismaClient|undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],//// log การ query เพื่อดูว่าเกิดอะไรขึ้นบ้าง
  })
if (process.env.NODE_ENV !=='production')globalForPrisma.prisma