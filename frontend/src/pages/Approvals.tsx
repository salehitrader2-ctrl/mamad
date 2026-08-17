import { useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button, EmptyState, ErrorText, PageHeader } from "../components/ui";
import { formatDate, formatNumber, formatToman, MONTH_LABELS } from "../lib/format";
import type { LeaveRequestItem, LoanRequestItem, PayslipRequestItem } from "../lib/types";

type Tab = "leave" | "loan" | "payslip";

const TABS: { key: Tab; label: string }[] = [
  { key: "leave", label: "مرخصی" },
  { key: "loan", label: "وام" },
  { key: "payslip", label: "فیش حقوقی" },
];

const ENDPOINT: Record<Tab, string> = {
  leave: "/leave/requests",
  loan: "/loan/requests",
  payslip: "/payslip/requests",
};

export function Approvals() {
  const [tab, setTab] = useState<Tab>("leave");
  const [leave, setLeave] = useState<LeaveRequestItem[]>([]);
  const [loan, setLoan] = useState<LoanRequestItem[]>([]);
  const [payslip, setPayslip] = useState<PayslipRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadAll() {
    setError("");
    try {
      const [leaveRes, loanRes, payslipRes] = await Promise.all([
        api.get<{ requests: LeaveRequestItem[] }>(`${ENDPOINT.leave}?scope=team`),
        api.get<{ requests: LoanRequestItem[] }>(`${ENDPOINT.loan}?scope=team`),
        api.get<{ requests: PayslipRequestItem[] }>(`${ENDPOINT.payslip}?scope=team`),
      ]);
      setLeave(leaveRes.requests);
      setLoan(loanRes.requests);
      setPayslip(payslipRes.requests);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "بارگذاری اطلاعات ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function decide(requestKind: Tab, id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`${ENDPOINT[requestKind]}/${id}/decision`, { status });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ثبت تصمیم ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  }

  const pendingCounts: Record<Tab, number> = {
    leave: leave.filter((r) => r.status === "PENDING").length,
    loan: loan.filter((r) => r.status === "PENDING").length,
    payslip: payslip.filter((r) => r.status === "PENDING").length,
  };

  return (
    <div>
      <PageHeader title="تأییدیه‌های تیم" subtitle="درخواست‌های اعضای تیم شما برای بررسی" />

      <div className="mb-4 flex gap-2 rounded-xl2 bg-surface-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
            }`}
          >
            {t.label}
            {pendingCounts[t.key] > 0 && (
              <span className="ms-1.5 rounded-full bg-warn-100 px-1.5 py-0.5 text-[10px] text-warn-700">
                {formatNumber(pendingCounts[t.key])}
              </span>
            )}
          </button>
        ))}
      </div>

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <p className="mt-2 text-sm text-ink-300">در حال بارگذاری...</p>
      ) : (
        <div className="mt-2 space-y-2">
          {tab === "leave" &&
            (leave.length === 0 ? (
              <EmptyState text="درخواست مرخصی‌ای ثبت نشده است." />
            ) : (
              leave.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {r.user?.fullName} — {formatNumber(r.days)} روز
                      </p>
                      <p className="mt-0.5 text-xs text-ink-300">
                        {formatDate(r.startDate)} تا {formatDate(r.endDate)}
                        {r.reason ? ` · ${r.reason}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.status === "PENDING" && (
                    <DecisionButtons
                      busy={busyId === r.id}
                      onApprove={() => decide("leave", r.id, "APPROVED")}
                      onReject={() => decide("leave", r.id, "REJECTED")}
                    />
                  )}
                </Card>
              ))
            ))}

          {tab === "loan" &&
            (loan.length === 0 ? (
              <EmptyState text="درخواست وامی ثبت نشده است." />
            ) : (
              loan.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {r.user?.fullName} — {formatToman(r.amount)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-300">
                        {formatNumber(r.installments)} قسط · {formatDate(r.createdAt)}
                        {r.reason ? ` · ${r.reason}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.status === "PENDING" && (
                    <DecisionButtons
                      busy={busyId === r.id}
                      onApprove={() => decide("loan", r.id, "APPROVED")}
                      onReject={() => decide("loan", r.id, "REJECTED")}
                    />
                  )}
                </Card>
              ))
            ))}

          {tab === "payslip" &&
            (payslip.length === 0 ? (
              <EmptyState text="درخواست فیش حقوقی‌ای ثبت نشده است." />
            ) : (
              payslip.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {r.user?.fullName} — فیش {MONTH_LABELS[r.month - 1]} {r.year}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-300">{formatDate(r.createdAt)}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.status === "PENDING" && (
                    <DecisionButtons
                      busy={busyId === r.id}
                      onApprove={() => decide("payslip", r.id, "APPROVED")}
                      onReject={() => decide("payslip", r.id, "REJECTED")}
                    />
                  )}
                </Card>
              ))
            ))}
        </div>
      )}
    </div>
  );
}

function DecisionButtons({
  busy,
  onApprove,
  onReject,
}: {
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="mt-3 flex gap-2 border-t border-surface-200 pt-3">
      <Button variant="primary" className="flex-1" disabled={busy} onClick={onApprove}>
        تأیید
      </Button>
      <Button variant="secondary" className="flex-1" disabled={busy} onClick={onReject}>
        رد
      </Button>
    </div>
  );
}
