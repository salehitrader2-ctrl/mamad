import type { Role, RequestStatus } from "./types";

const jalaliDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return jalaliDate.format(date);
}

export function formatNumber(value: number): string {
  return value.toLocaleString("fa-IR");
}

export function formatToman(value: number): string {
  return `${formatNumber(value)} تومان`;
}

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "کارمند",
  MANAGER: "سرپرست",
  HR_ADMIN: "منابع انسانی",
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
};

export const MONTH_LABELS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
