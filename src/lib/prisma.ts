import { PrismaClient } from '@prisma/client';
import { validateEnv } from '@/lib/validations';

// Only validate env at runtime, not during Next.js build
if (process.env.NODE_ENV !== 'production' || process.env.DATABASE_URL) {
  validateEnv();
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
