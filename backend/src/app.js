const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const leaveRoutes = require("./routes/leave.routes");
const loanRoutes = require("./routes/loan.routes");
const payslipRoutes = require("./routes/payslip.routes");
const usersRoutes = require("./routes/users.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "raandaman-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/payslip", payslipRoutes);
app.use("/api/users", usersRoutes);

// 404 fallback
app.use("/api", (req, res) => {
  res.status(404).json({ error: "مسیر یافت نشد." });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "خطای داخلی سرور رخ داده است." });
});

module.exports = app;
