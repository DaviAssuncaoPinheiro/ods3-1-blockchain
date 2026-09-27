import type { ReactNode } from "react";

import { AlertIcon, CheckCircleIcon, InfoIcon } from "./icons";

type NoticeTone = "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<NoticeTone, string> = {
  info: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

const TONE_ICONS: Record<NoticeTone, typeof InfoIcon> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertIcon,
  danger: AlertIcon,
};

interface NoticeProps {
  tone: NoticeTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function Notice({ tone, title, children, action }: NoticeProps) {
  const ToneIcon = TONE_ICONS[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex flex-wrap items-start gap-3 rounded-xl px-4 py-3 ${TONE_CLASSES[tone]}`}
    >
      <ToneIcon className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {children && <div className="mt-1 text-sm text-ink">{children}</div>}
      </div>
      {action}
    </div>
  );
}
