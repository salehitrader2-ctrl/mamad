const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Passw0rd!", 10);

  const company = await prisma.company.create({
    data: { name: "شرکت تولیدی نمونه" },
  });

  const hrAdmin = await prisma.user.create({
    data: {
      companyId: company.id,
      fullName: "زهرا احمدی",
      nationalCode: "0011111111",
      password: passwordHash,
      role: "HR_ADMIN",
      position: "مدیر منابع انسانی",
      leaveBalanceDays: 20,
    },
  });

  const manager = await prisma.user.create({
    data: {
      companyId: company.id,
      fullName: "رضا کریمی",
      nationalCode: "0022222222",
      password: passwordHash,
      role: "MANAGER",
      position: "سرپرست خط تولید",
      leaveBalanceDays: 18,
    },
  });

  await prisma.user.create({
    data: {
      companyId: company.id,
      fullName: "علی محمدی",
      nationalCode: "0033333333",
      password: passwordHash,
      role: "EMPLOYEE",
      position: "اپراتور خط تولید",
      managerId: manager.id,
      leaveBalanceDays: 12.5,
    },
  });

  await prisma.user.create({
    data: {
      companyId: company.id,
      fullName: "سارا حسینی",
      nationalCode: "0044444444",
      password: passwordHash,
      role: "EMPLOYEE",
      position: "کنترل کیفیت",
      managerId: manager.id,
      leaveBalanceDays: 9,
    },
  });

  console.log("Seed complete. Demo accounts (password: Passw0rd!):");
  console.log("  HR Admin  -> nationalCode: 0011111111");
  console.log("  Manager   -> nationalCode: 0022222222");
  console.log("  Employee  -> nationalCode: 0033333333");
  console.log("  Employee  -> nationalCode: 0044444444");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
