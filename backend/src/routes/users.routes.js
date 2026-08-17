const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/users/team - list of employees a manager/HR admin can see, with pending counts.
router.get("/team", requireRole("MANAGER", "HR_ADMIN"), async (req, res) => {
  const where =
    req.user.role === "HR_ADMIN"
      ? { companyId: req.user.companyId }
      : { managerId: req.user.id };

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      position: true,
      role: true,
      leaveBalanceDays: true,
    },
    orderBy: { fullName: "asc" },
  });

  res.json({ users });
});

module.exports = router;
