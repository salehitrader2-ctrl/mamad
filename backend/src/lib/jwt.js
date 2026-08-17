const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "dev-secret-do-not-use-in-production";
const EXPIRES_IN = "7d";

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, companyId: user.companyId },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
