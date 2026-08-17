const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { signToken } = require("../lib/jwt");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login  { nationalCode, password }
router.post("/login", async (req, res) => {
  const { nationalCode, password } = req.body || {};

  if (!nationalCode || !password) {
    return res.status(400).json({ error: "کد ملی و رمز عبور الزامی است." });
  }

  const user = await prisma.user.findUnique({ where: { nationalCode } });
  if (!user) {
    return res.status(401).json({ error: "کد ملی یا رمز عبور اشتباه است." });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "کد ملی یا رمز عبور اشتباه است." });
  }

  const token = signToken(user);
  const { password: _omit, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
