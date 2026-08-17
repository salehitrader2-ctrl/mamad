const { verifyToken } = require("../lib/jwt");
const prisma = require("../lib/prisma");

/**
 * Requires a valid Bearer token. Attaches the authenticated user (without
 * the password hash) to req.user.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "توکن احراز هویت ارسال نشده است." });
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: "کاربر یافت نشد." });
    }
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ error: "توکن نامعتبر یا منقضی شده است." });
  }
}

/**
 * Restricts a route to a set of roles, e.g. requireRole("MANAGER", "HR_ADMIN").
 * Must run after requireAuth.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "دسترسی مجاز نیست." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
