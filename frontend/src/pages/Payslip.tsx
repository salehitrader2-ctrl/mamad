import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { Button, EmptyState, ErrorText, Field, Input, PageHeader, Select } from "../components/ui";
import { formatDate, MONTH_LABELS } from "../lib/format";
import type { PayslipRequestItem } from "../lib/types";

function currentJalaliYear(): number {
  const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).formatToParts(
    new Date()
  );
  const yearPart = parts.find((p) => p.type === "year")?.value ?? "";
  const digits = yearPart.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 1300 ? parsed : 1404;
}

export function Payslip() {
  const [requests, setRequests] = useState<PayslipRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultYear = useMemo(() => currentJalaliYear(), []);
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState(String(defaultYear));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    const res = await api.get<{ requests: PayslipRequestItem[] }>("/payslip/requests");
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
      await api.post("/payslip/requests", { month: Number(month), year: Number(year) });
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ثبت درخواست ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="درخواست فیش حقوقی" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="ماه">
              <Select value={month} onChange={(e) => setMonth((e.target as HTMLSelectElement).value)}>
                {MONTH_LABELS.map((label, idx) => (
                  <option key={label} value={idx + 1}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="سال">
              <Input
                type="number"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </Field>
          </div>
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
        <EmptyState text="هنوز درخواست فیش حقوقی ثبت نشده است." />
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    فیش {MONTH_LABELS[r.month - 1]} {r.year}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-300">{formatDate(r.createdAt)}</p>
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
