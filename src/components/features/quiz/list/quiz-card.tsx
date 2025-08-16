import { Calendar, Clock, Bookmark } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/layout";
import { Quiz } from "@/lib/types/quiz";
import { QuizActions } from "./quiz-actions";
import { QuizStatusBadge } from "./quiz-status-badge";
import { formatDate } from "@/lib/utils";

interface QuizCardProps {
  quiz: Quiz;
  subjectName: string;
}

export function QuizCard({ quiz, subjectName }: QuizCardProps) {
  const quizStatus = quiz.status || "pending";

  return (
    <Card className="h-full border-2 border-border hover:border-primary transition-all">
      <CardContent className="pb-0">
        <div className="flex flex-col h-full space-y-2 sm:space-y-3">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 truncate">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                {quiz.name}
              </h3>
            </div>
            <QuizStatusBadge
              status={quizStatus}
              className="flex-shrink-0 ml-2"
            />
          </div>

          <div className="flex items-center text-muted-foreground">
            <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm line-clamp-1">
              {subjectName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-auto">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{quiz.duration} phút</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">
                {formatDate(quiz.update_time)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 sm:pt-4 pb-2 sm:pb-3 px-3 sm:px-4 flex justify-between">
        <QuizActions quizId={quiz.quiz_id} status={quizStatus} />
      </CardFooter>
    </Card>
  );
}
