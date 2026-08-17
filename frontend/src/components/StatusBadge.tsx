import type { RequestStatus } from "../lib/types";
import { STATUS_LABELS } from "../lib/format";

const STYLES: Record<RequestStatus, string> = {
  PENDING: "bg-warn-100 text-warn-700",
  APPROVED: "bg-good-100 text-good-700",
  REJECTED: "bg-bad-100 text-bad-700",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
