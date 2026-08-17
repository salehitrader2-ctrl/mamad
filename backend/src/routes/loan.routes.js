const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/loan/requests?scope=mine|team
router.get("/requests", async (req, res) => {
  const scope = req.query.scope === "team" ? "team" : "mine";

  if (scope === "team" && ["MANAGER", "HR_ADMIN"].includes(req.user.role)) {
    const where =
      req.user.role === "HR_ADMIN"
        ? { user: { companyId: req.user.companyId } }
        : { user: { managerId: req.user.id } };

    const requests = await prisma.loanRequest.findMany({
      where,
      include: { user: { select: { fullName: true, position: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ requests });
  }

  const requests = await prisma.loanRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ requests });
});

// POST /api/loan/requests { amount, installments, reason }
router.post("/requests", async (req, res) => {
  const { amount, installments, reason } = req.body || {};
  const amountNum = Number(amount);
  const installmentsNum = Number(installments);

  if (!amountNum || amountNum <= 0) {
    return res.status(400).json({ error: "مبلغ وام نامعتبر است." });
  }
  if (!installmentsNum || installmentsNum <= 0) {
    return res.status(400).json({ error: "تعداد اقساط نامعتبر است." });
  }

  const request = await prisma.loanRequest.create({
    data: {
      userId: req.user.id,
      amount: Math.round(amountNum),
      installments: Math.round(installmentsNum),
      reason: reason || null,
    },
  });

  res.status(201).json({ request });
});

// PATCH /api/loan/requests/:id/decision { status, reviewNote }
router.patch(
  "/requests/:id/decision",
  requireRole("MANAGER", "HR_ADMIN"),
  async (req, res) => {
    const { status, reviewNote } = req.body || {};
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "وضعیت نامعتبر است." });
    }

    const existing = await prisma.loanRequest.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "درخواست یافت نشد." });
    }
    if (existing.user.companyId !== req.user.companyId) {
      return res.status(403).json({ error: "دسترسی مجاز نیست." });
    }
    if (existing.status !== "PENDING") {
      return res.status(409).json({ error: "این درخواست قبلاً بررسی شده است." });
    }

    const updated = await prisma.loanRequest.update({
      where: { id: existing.id },
      data: { status, reviewNote: reviewNote || null },
    });

    res.json({ request: updated });
  }
);

module.exports = router;
