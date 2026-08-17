import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ROLE_LABELS } from "../lib/format";
import {
  ApprovalsIcon,
  CalendarIcon,
  HomeIcon,
  LogoutIcon,
  ReceiptIcon,
  WalletIcon,
} from "./icons";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
}

export function AppShell() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items: NavItem[] = [
    { to: "/", label: "خانه", icon: HomeIcon },
    { to: "/leave", label: "مرخصی", icon: CalendarIcon },
    { to: "/loan", label: "وام", icon: WalletIcon },
    { to: "/payslip", label: "فیش حقوقی", icon: ReceiptIcon },
  ];
  if (user.role === "MANAGER" || user.role === "HR_ADMIN") {
    items.push({ to: "/approvals", label: "تأییدیه‌ها", icon: ApprovalsIcon });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-e border-surface-200 bg-white md:flex md:flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            ر
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">راندمان</p>
            <p className="text-xs text-ink-300">شرکت تولیدی نمونه</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-500 hover:bg-surface-100 hover:text-ink-900"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-surface-200 px-3 py-4">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-medium text-ink-900">{user.fullName}</p>
            <p className="text-xs text-ink-300">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-500 transition hover:bg-surface-100 hover:text-bad-700"
          >
            <LogoutIcon className="h-5 w-5" />
            خروج
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            ر
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-ink-900">راندمان</p>
          </div>
        </div>
        <button
          onClick={logout}
          aria-label="خروج"
          className="rounded-lg p-2 text-ink-500 hover:bg-surface-100"
        >
          <LogoutIcon className="h-5 w-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-8 md:pt-6">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-10 flex border-t border-surface-200 bg-white/95 backdrop-blur md:hidden">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                isActive ? "text-brand-600" : "text-ink-300"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
