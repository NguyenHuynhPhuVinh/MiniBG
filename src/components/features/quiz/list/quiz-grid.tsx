import { Quiz } from "@/lib/types/quiz";
import { QuizCard } from "./quiz-card";

interface QuizGridProps {
  quizzes: Quiz[];
  getSubjectName: (subjectId: number) => string;
}

export function QuizGrid({ quizzes, getSubjectName }: QuizGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.quiz_id}
          quiz={quiz}
          subjectName={
            quiz.Subject ? quiz.Subject.name : getSubjectName(quiz.subject_id)
          }
        />
      ))}
    </div>
  );
}
