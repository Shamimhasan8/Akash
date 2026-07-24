import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Wrapped in try/catch so the import doesn't crash on Vercel serverless
// (SQLite file path may not exist in the deployed environment).
// None of the AKASH AI routes (ask/story/quiz/health) use the DB.
let _prisma: PrismaClient | undefined
try {
  _prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma
} catch (e) {
  console.warn('[db] PrismaClient init failed (expected on serverless):', e)
}

export const db = _prisma