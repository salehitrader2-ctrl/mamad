import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";
import { Button, ErrorText, Field, Input } from "../components/ui";

export function Login() {
  const { user, login } = useAuth();
  const [nationalCode, setNationalCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(nationalCode.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ورود ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl2 bg-brand-600 text-lg font-bold text-white">
            ر
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-ink-900">ورود به راندمان</h1>
            <p className="mt-1 text-sm text-ink-500">
              مرخصی، وام و فیش حقوقی خود را از اینجا مدیریت کنید.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-surface-200 bg-white p-5 shadow-sm">
          <Field label="کد ملی">
            <Input
              inputMode="numeric"
              autoComplete="username"
              value={nationalCode}
              onChange={(e) => setNationalCode(e.target.value)}
              placeholder="مثلاً 0033333333"
              required
            />
          </Field>
          <Field label="رمز عبور">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>

          <ErrorText>{error}</ErrorText>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "در حال ورود..." : "ورود"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-300">
          نسخه‌ی آزمایشی — کد ملی: 0033333333 / رمز: Passw0rd!
        </p>
      </div>
    </div>
  );
}
