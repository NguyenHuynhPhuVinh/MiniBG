import React, { useState } from "react";
import { Question } from "@/lib/types/quiz";
import { Card, CardHeader, CardContent } from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Shuffle,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";

interface QuestionListProps {
  questions: Question[];
  onReshuffle: () => void;
  isReshuffleLoading?: boolean;
}

export function QuestionList({
  questions,
  onReshuffle,
  isReshuffleLoading = false,
}: QuestionListProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  // Toggle mở rộng câu hỏi
  const toggleExpand = (questionId: number) => {
    setExpandedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Kiểm tra nếu câu hỏi đang mở rộng
  const isExpanded = (questionId: number) => {
    return expandedQuestions.includes(questionId);
  };

  if (!questions.length) {
    return (
      <EmptyState
        title="Không có câu hỏi"
        description="Chưa có câu hỏi nào trong bài kiểm tra này."
        icon="ClipboardList"
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold">
          Danh sách câu hỏi ({questions.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReshuffle}
          disabled={isReshuffleLoading}
          title="Trộn lại câu hỏi"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer self-end sm:self-auto"
        >
          {isReshuffleLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Shuffle className="h-3.5 w-3.5 mr-1.5" />
          )}
          Trộn lại câu hỏi
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {questions.map((question, index) => (
          <Card
            key={question.question_id}
            onClick={() => toggleExpand(question.question_id)}
            className="overflow-hidden cursor-pointer border-2 bg-card hover:border-primary"
          >
            <CardHeader className="flex flex-row items-start gap-3 sm:gap-4 justify-between">
              <div className="space-y-2 sm:space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex-shrink-0 size-7 sm:size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0 sm:py-0.5"
                    >
                      {question.question_type.name}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0 sm:py-0.5"
                    >
                      {question.level.name}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm sm:text-base font-medium whitespace-pre-line">
                  {question.question_text}
                </p>
              </div>
              <div className="pt-1">
                <div className="size-7 sm:size-8 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                  {isExpanded(question.question_id) ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded(question.question_id) && (
              <CardContent className="px-4 sm:px-6 py-4 sm:py-5 border-t bg-muted/5">
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid gap-3 sm:gap-4">
                    {question.answers.map((answer) => (
                      <div
                        key={answer.answer_id}
                        className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-md ${
                          answer.iscorrect
                            ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800"
                            : "bg-muted/20 border border-border"
                        }`}
                      >
                        <div
                          className={`size-5 sm:size-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                            answer.iscorrect
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {answer.iscorrect ? (
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                        </div>
                        <div className="text-xs sm:text-sm leading-relaxed">
                          {answer.answer_text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="p-3 sm:p-4 rounded-md bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                      <p className="text-xs sm:text-sm font-medium mb-1 text-blue-700 dark:text-blue-400">
                        Giải thích:
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
