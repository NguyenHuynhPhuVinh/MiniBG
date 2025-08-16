import { cn } from "@/lib/utils";

interface QuizStatusBadgeProps {
  status: "pending" | "active" | "finished";
  className?: string;
}

export function QuizStatusBadge({ status, className }: QuizStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "Đang diễn ra",
          className: "bg-success/10 text-success",
        };
      case "finished":
        return {
          label: "Đã kết thúc",
          className: "bg-muted text-muted-foreground",
        };
      case "pending":
      default:
        return {
          label: "Chưa bắt đầu",
          className: "bg-warning/10 text-warning",
        };
    }
  };

  const { label, className: statusClassName } = getStatusConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap",
        statusClassName,
        className
      )}
    >
      {label}
    </span>
  );
}
