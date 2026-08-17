const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function daysBetweenInclusive(startDate, endDate) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
  return Math.max(diff, 0);
}

// GET /api/leave/balance
router.get("/balance", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ leaveBalanceDays: user.leaveBalanceDays });
});

// GET /api/leave/requests?scope=mine|team
router.get("/requests", async (req, res) => {
  const scope = req.query.scope === "team" ? "team" : "mine";

  if (scope === "team" && ["MANAGER", "HR_ADMIN"].includes(req.user.role)) {
    const where =
      req.user.role === "HR_ADMIN"
        ? { user: { companyId: req.user.companyId } }
        : { user: { managerId: req.user.id } };

    const requests = await prisma.leaveRequest.findMany({
      where,
      include: { user: { select: { fullName: true, position: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ requests });
  }

  const requests = await prisma.leaveRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ requests });
});

// POST /api/leave/requests { startDate, endDate, reason }
router.post("/requests", async (req, res) => {
  const { startDate, endDate, reason } = req.body || {};
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "تاریخ شروع و پایان مرخصی الزامی است." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return res.status(400).json({ error: "بازه‌ی تاریخ نامعتبر است." });
  }

  const days = daysBetweenInclusive(start, end);

  const request = await prisma.leaveRequest.create({
    data: {
      userId: req.user.id,
      startDate: start,
      endDate: end,
      days,
      reason: reason || null,
    },
  });

  res.status(201).json({ request });
});

// PATCH /api/leave/requests/:id/decision { status, reviewNote }
router.patch(
  "/requests/:id/decision",
  requireRole("MANAGER", "HR_ADMIN"),
  async (req, res) => {
    const { status, reviewNote } = req.body || {};
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "وضعیت نامعتبر است." });
    }

    const existing = await prisma.leaveRequest.findUnique({
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

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id: existing.id },
        data: { status, reviewNote: reviewNote || null },
      });

      if (status === "APPROVED") {
        await tx.user.update({
          where: { id: existing.userId },
          data: { leaveBalanceDays: { decrement: existing.days } },
        });
      }

      return updated;
    });

    res.json({ request: result });
  }
);

module.exports = router;
