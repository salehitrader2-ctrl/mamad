const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/payslip/requests?scope=mine|team
router.get("/requests", async (req, res) => {
  const scope = req.query.scope === "team" ? "team" : "mine";

  if (scope === "team" && ["MANAGER", "HR_ADMIN"].includes(req.user.role)) {
    const where =
      req.user.role === "HR_ADMIN"
        ? { user: { companyId: req.user.companyId } }
        : { user: { managerId: req.user.id } };

    const requests = await prisma.payslipRequest.findMany({
      where,
      include: { user: { select: { fullName: true, position: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ requests });
  }

  const requests = await prisma.payslipRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ requests });
});

// POST /api/payslip/requests { month, year }
router.post("/requests", async (req, res) => {
  const month = Number(req.body?.month);
  const year = Number(req.body?.year);

  if (!month || month < 1 || month > 12) {
    return res.status(400).json({ error: "ماه نامعتبر است." });
  }
  if (!year || year < 1300) {
    return res.status(400).json({ error: "سال نامعتبر است." });
  }

  const request = await prisma.payslipRequest.create({
    data: { userId: req.user.id, month, year },
  });

  res.status(201).json({ request });
});

// PATCH /api/payslip/requests/:id/decision { status }
router.patch(
  "/requests/:id/decision",
  requireRole("MANAGER", "HR_ADMIN"),
  async (req, res) => {
    const { status } = req.body || {};
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "وضعیت نامعتبر است." });
    }

    const existing = await prisma.payslipRequest.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "درخواست یافت نشد." });
    }
    if (existing.user.companyId !== req.user.companyId) {
      return res.status(403).json({ error: "دسترسی مجاز نیست." });
    }

    const updated = await prisma.payslipRequest.update({
      where: { id: existing.id },
      data: { status },
    });

    res.json({ request: updated });
  }
);

module.exports = router;
