import Link from "next/link";
import { DoorOpen, FileText, BarChart, Eye } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { useRouter } from "next/navigation";

interface QuizActionsProps {
  quizId: number;
  status: string;
  onStart?: (id: number) => Promise<void>;
}

export function QuizActions({ quizId, status }: QuizActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
      {status === "pending" && (
        <Button
          variant="default"
          size="sm"
          title="Vào phòng chờ"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1"
          is3DNoLayout={true}
          onClick={() => router.push(`/quiz-waiting-room/${quizId}`)}
        >
          <DoorOpen className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Vào phòng</span>
        </Button>
      )}

      {status === "active" && (
        <Button
          variant="default"
          size="sm"
          title="Xem phòng"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1"
          onClick={() => router.push(`/quiz-waiting-room/${quizId}`)}
        >
          <Eye className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Xem phòng</span>
        </Button>
      )}

      {status === "finished" && (
        <Button
          variant="default"
          size="sm"
          title="Xem báo cáo kết quả"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1"
          onClick={() => router.push(`/dashboard/reports/quiz-results?quizId=${quizId}`)}
        >
          <BarChart className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Báo cáo</span>
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        title="Xem chi tiết"
        className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1 border-2"
        asChild
      >
        <Link href={`/dashboard/teaching/quizzes/detail/${quizId}`}>
          <FileText className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Chi tiết</span>
        </Link>
      </Button>
    </div>
  );
}
