import { EmptyState } from "@/components/ui/feedback";
import { Card } from "@/components/ui/layout";

interface QuizEmptyStateProps {
  isSearching: boolean;
}

export function QuizEmptyState({ isSearching }: QuizEmptyStateProps) {
  return (
    <Card className="border bg-muted/5 sm:border-2">
      <div className="py-8 sm:py-10 md:py-12">
        <EmptyState
          title={
            isSearching
              ? "Không tìm thấy bài kiểm tra"
              : "Chưa có bài kiểm tra nào"
          }
          description={
            isSearching
              ? "Không có bài kiểm tra nào phù hợp với từ khóa tìm kiếm"
              : "Hãy tạo bài kiểm tra đầu tiên của bạn để bắt đầu"
          }
          icon="ClipboardList"
          className="mx-auto max-w-sm sm:max-w-md"
        />
      </div>
    </Card>
  );
}
