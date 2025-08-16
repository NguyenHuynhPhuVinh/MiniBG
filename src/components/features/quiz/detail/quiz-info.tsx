import { Badge } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { QuizDetail } from "@/lib/types/quiz";
import {
  CalendarClock,
  Clock,
  Hash,
  Info,
  CheckCircle2,
  AlertCircle,
  HourglassIcon,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface QuizInfoProps {
  quiz: QuizDetail;
}

export function QuizInfo({ quiz }: QuizInfoProps) {
  // Tạo mapping màu cho trạng thái
  const statusVariant = {
    pending: "secondary",
    active: "default",
    finished: "outline",
  } as const;

  // Tạo mapping icon cho trạng thái
  const statusIcon = {
    pending: <HourglassIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />,
    active: <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />,
    finished: <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />,
  };

  // Định dạng thời gian
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa thiết lập";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  return (
    <Card className="bg-card border-2 overflow-hidden">
      <CardContent>
        <div>
          <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 flex-wrap mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
              {quiz.name}
            </h3>
            <Badge
              variant={statusVariant[quiz.status]}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium flex items-center"
            >
              {statusIcon[quiz.status]}
              {quiz.status === "pending" && "Chưa bắt đầu"}
              {quiz.status === "active" && "Đang diễn ra"}
              {quiz.status === "finished" && "Đã hoàn thành"}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {quiz.subject_name}
          </p>
        </div>

        <div className="border-t bg-muted/5 p-4 sm:p-5 md:px-7 md:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-7">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium mb-0.5 text-muted-foreground">
                  Thời gian làm bài
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {quiz.duration} phút
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Hash className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium mb-0.5 text-muted-foreground">
                  Mã PIN
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {quiz.pin || "Chưa có"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium mb-0.5 text-muted-foreground">
                  Thời gian bắt đầu
                </p>
                <p className="text-sm sm:text-base font-medium overflow-hidden text-ellipsis">
                  {formatDate(quiz.start_time)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium mb-0.5 text-muted-foreground">
                  Thời gian kết thúc
                </p>
                <p className="text-sm sm:text-base font-medium overflow-hidden text-ellipsis">
                  {formatDate(quiz.end_time)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t py-4 sm:py-3 md:py-4 bg-muted/10 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <p>Cập nhật lần cuối: {formatDate(quiz.update_time)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
