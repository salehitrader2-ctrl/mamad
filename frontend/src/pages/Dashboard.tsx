import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState, PageHeader } from "../components/ui";
import { formatDate, formatNumber } from "../lib/format";
import { ApprovalsIcon, CalendarIcon, ReceiptIcon, WalletIcon } from "../components/icons";
import type { LeaveRequestItem, LoanRequestItem, PayslipRequestItem } from "../lib/types";

type ActivityItem =
  | { kind: "leave"; item: LeaveRequestItem }
  | { kind: "loan"; item: LoanRequestItem }
  | { kind: "payslip"; item: PayslipRequestItem };

const KIND_LABEL: Record<ActivityItem["kind"], string> = {
  leave: "مرخصی",
  loan: "وام",
  payslip: "فیش حقوقی",
};

export function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pendingTeamCount, setPendingTeamCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const isReviewer = user?.role === "MANAGER" || user?.role === "HR_ADMIN";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [balanceRes, leaveRes, loanRes, payslipRes] = await Promise.all([
        api.get<{ leaveBalanceDays: number }>("/leave/balance"),
        api.get<{ requests: LeaveRequestItem[] }>("/leave/requests"),
        api.get<{ requests: LoanRequestItem[] }>("/loan/requests"),
        api.get<{ requests: PayslipRequestItem[] }>("/payslip/requests"),
      ]);

      if (cancelled) return;

      setBalance(balanceRes.leaveBalanceDays);

      const merged: ActivityItem[] = [
        ...leaveRes.requests.map((item): ActivityItem => ({ kind: "leave", item })),
        ...loanRes.requests.map((item): ActivityItem => ({ kind: "loan", item })),
        ...payslipRes.requests.map((item): ActivityItem => ({ kind: "payslip", item })),
      ].sort(
        (a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime()
      );
      setActivity(merged.slice(0, 5));

      if (isReviewer) {
        const [teamLeave, teamLoan, teamPayslip] = await Promise.all([
          api.get<{ requests: LeaveRequestItem[] }>("/leave/requests?scope=team"),
          api.get<{ requests: LoanRequestItem[] }>("/loan/requests?scope=team"),
          api.get<{ requests: PayslipRequestItem[] }>("/payslip/requests?scope=team"),
        ]);
        if (cancelled) return;
        const count = [...teamLeave.requests, ...teamLoan.requests, ...teamPayslip.requests].filter(
          (r) => r.status === "PENDING"
        ).length;
        setPendingTeamCount(count);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isReviewer]);

  return (
    <div>
      <PageHeader
        title={`سلام ${user?.fullName?.split(" ")[0] ?? ""} 👋`}
        subtitle={user?.position ?? undefined}
      />

      <Card className="mb-4 flex items-center justify-between bg-brand-600 text-white">
        <div>
          <p className="text-sm text-brand-50">مانده مرخصی</p>
          <p className="mt-1 text-3xl font-bold">
            {balance === null ? "—" : formatNumber(balance)}
            <span className="ms-1 text-base font-normal text-brand-50">روز</span>
          </p>
        </div>
        <CalendarIcon className="h-10 w-10 text-brand-100" />
      </Card>

      {isReviewer && pendingTeamCount !== null && pendingTeamCount > 0 && (
        <Link to="/approvals">
          <Card className="mb-4 flex items-center justify-between border-warn-100 bg-warn-100/60">
            <div className="flex items-center gap-3">
              <ApprovalsIcon className="h-6 w-6 text-warn-700" />
              <p className="text-sm font-medium text-warn-700">
                {formatNumber(pendingTeamCount)} درخواست در انتظار بررسی شما
              </p>
            </div>
          </Card>
        </Link>
      )}

      <div className="mb-5 grid grid-cols-3 gap-3">
        <QuickAction to="/leave" icon={CalendarIcon} label="درخواست مرخصی" />
        <QuickAction to="/loan" icon={WalletIcon} label="درخواست وام" />
        <QuickAction to="/payslip" icon={ReceiptIcon} label="فیش حقوقی" />
      </div>

      <PageHeader title="آخرین فعالیت‌ها" />
      {loading ? (
        <p className="text-sm text-ink-300">در حال بارگذاری...</p>
      ) : activity.length === 0 ? (
        <EmptyState text="هنوز درخواستی ثبت نکرده‌اید." />
      ) : (
        <div className="space-y-2">
          {activity.map(({ kind, item }) => (
            <Card key={`${kind}-${item.id}`} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-900">{KIND_LABEL[kind]}</p>
                <p className="mt-0.5 text-xs text-ink-300">{formatDate(item.createdAt)}</p>
              </div>
              <StatusBadge status={item.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: (props: { className?: string }) => JSX.Element;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-xl2 border border-surface-200 bg-white p-3 text-center shadow-sm transition hover:border-brand-400 hover:shadow"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-medium text-ink-700">{label}</span>
    </Link>
  );
}
