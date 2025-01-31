import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
  });
};

const prismadb = globalThis.prisma ?? prismaClientSingleton();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismadb;
}

// Cleanup on process shutdown
const shutdown = async () => {
  await prismadb.$disconnect();
  process.exit(0);
};

process.on('beforeExit', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default prismadb;
