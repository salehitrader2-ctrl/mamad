import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button, EmptyState, ErrorText, Field, Input, PageHeader, Textarea } from "../components/ui";
import { formatDate, formatNumber } from "../lib/format";
import type { LeaveRequestItem } from "../lib/types";

export function Leave() {
  const [balance, setBalance] = useState<number | null>(null);
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    const [balanceRes, requestsRes] = await Promise.all([
      api.get<{ leaveBalanceDays: number }>("/leave/balance"),
      api.get<{ requests: LeaveRequestItem[] }>("/leave/requests"),
    ]);
    setBalance(balanceRes.leaveBalanceDays);
    setRequests(requestsRes.requests);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/leave/requests", { startDate, endDate, reason: reason || undefined });
      setStartDate("");
      setEndDate("");
      setReason("");
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ثبت درخواست ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="درخواست مرخصی"
        subtitle={balance !== null ? `مانده فعلی: ${formatNumber(balance)} روز` : undefined}
      />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="از تاریخ">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Field>
            <Field label="تا تاریخ">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="دلیل (اختیاری)">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثلاً مرخصی استعلاجی، کارهای شخصی و..."
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "در حال ثبت..." : "ثبت درخواست"}
          </Button>
        </form>
      </Card>

      <PageHeader title="سوابق درخواست‌ها" />
      {loading ? (
        <p className="text-sm text-ink-300">در حال بارگذاری...</p>
      ) : requests.length === 0 ? (
        <EmptyState text="هنوز درخواست مرخصی ثبت نشده است." />
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    {formatDate(r.startDate)} تا {formatDate(r.endDate)}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-300">
                    {formatNumber(r.days)} روز
                    {r.reason ? ` · ${r.reason}` : ""}
                  </p>
                  {r.reviewNote && (
                    <p className="mt-1 text-xs text-ink-500">یادداشت بررسی: {r.reviewNote}</p>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
