import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button, EmptyState, ErrorText, Field, Input, PageHeader, Textarea } from "../components/ui";
import { formatDate, formatNumber, formatToman } from "../lib/format";
import type { LoanRequestItem } from "../lib/types";

export function Loan() {
  const [requests, setRequests] = useState<LoanRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    const res = await api.get<{ requests: LoanRequestItem[] }>("/loan/requests");
    setRequests(res.requests);
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
      await api.post("/loan/requests", {
        amount: Number(amount),
        installments: Number(installments),
        reason: reason || undefined,
      });
      setAmount("");
      setInstallments("");
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
      <PageHeader title="درخواست وام" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="مبلغ درخواستی (تومان)">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثلاً 20000000"
              required
            />
          </Field>
          <Field label="تعداد اقساط">
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={36}
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              placeholder="مثلاً 6"
              required
            />
          </Field>
          <Field label="دلیل (اختیاری)">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="توضیح کوتاه درباره‌ی دلیل درخواست"
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
        <EmptyState text="هنوز درخواست وامی ثبت نشده است." />
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">{formatToman(r.amount)}</p>
                  <p className="mt-0.5 text-xs text-ink-300">
                    {formatNumber(r.installments)} قسط · {formatDate(r.createdAt)}
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
