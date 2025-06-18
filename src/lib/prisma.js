import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "pretty",
  });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Gracefully disconnect on process termination
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
