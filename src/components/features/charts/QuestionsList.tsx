"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface Answer {
  answer_id: number;
  answer_text: string;
  iscorrect: boolean;
}

interface Question {
  question_id: number;
  question_text: string;
  answers?: Answer[];
  student_answer?: {
    selected_answer_id: number;
    selected_answer_text: string;
    is_correct: boolean;
    time_spent?: number;
    attempt_date?: string;
  } | null;
}

interface QuestionsListProps {
  questions: Question[];
  title?: string;
  className?: string;
  loading?: boolean;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  title,
  className = "",
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Đang tải danh sách câu hỏi...
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Chưa có câu hỏi nào</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h5 className="font-bold text-lg mb-4 text-center bg-blue-100 p-3 rounded-lg">
          📋 {title} ({questions.length} câu)
        </h5>
      )}
      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <div
            key={question.question_id}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-blue-600">
                  Câu {qIndex + 1}:
                </span>
                <p className="text-sm font-medium flex-1">
                  {question.question_text}
                </p>
              </div>
            </div>

            {/* Student selection summary removed */}

            {/* Answers - highlight đúng và đánh dấu đáp án đã chọn */}
            {question.answers && question.answers.length > 0 && (
              <div className="space-y-2">
                {question.answers.map((answer, aIndex) => (
                  <div
                    key={answer.answer_id}
                    className={`flex items-center gap-2 p-2 rounded text-sm relative ${(() => {
                      const isSelected =
                        !!question.student_answer &&
                        question.student_answer.selected_answer_id ===
                          answer.answer_id;
                      const isCorrect = !!answer.iscorrect;
                      if (isCorrect) {
                        return "bg-green-100 border border-green-300";
                      }
                      if (isSelected) {
                        return "bg-red-100 border border-red-300";
                      }
                      return "bg-white border border-gray-200";
                    })()}`}
                  >
                    <span className="font-medium text-xs w-6">
                      {String.fromCharCode(65 + aIndex)}.
                    </span>
                    <span className="flex-1">{answer.answer_text}</span>
                    {answer.iscorrect && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    {question.student_answer &&
                      question.student_answer.selected_answer_id ===
                        answer.answer_id &&
                      !answer.iscorrect && (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionsList;
