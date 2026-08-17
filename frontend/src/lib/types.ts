export type Role = "EMPLOYEE" | "MANAGER" | "HR_ADMIN";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  companyId: string;
  fullName: string;
  nationalCode: string;
  role: Role;
  position: string | null;
  managerId: string | null;
  leaveBalanceDays: number;
  createdAt: string;
}

interface RequesterInfo {
  fullName: string;
  position: string | null;
}

export interface LeaveRequestItem {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string | null;
  status: RequestStatus;
  reviewNote: string | null;
  createdAt: string;
  user?: RequesterInfo;
}

export interface LoanRequestItem {
  id: string;
  userId: string;
  amount: number;
  installments: number;
  reason: string | null;
  status: RequestStatus;
  reviewNote: string | null;
  createdAt: string;
  user?: RequesterInfo;
}

export interface PayslipRequestItem {
  id: string;
  userId: string;
  month: number;
  year: number;
  status: RequestStatus;
  createdAt: string;
  user?: RequesterInfo;
}

export interface TeamMember {
  id: string;
  fullName: string;
  position: string | null;
  role: Role;
  leaveBalanceDays: number;
}
