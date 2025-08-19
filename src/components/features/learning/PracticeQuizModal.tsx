"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import {
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Target,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  practiceRecommendationService,
  type PracticeQuestion,
  type GeneratePracticeResponse,
} from "@/lib/services/api/practice-recommendation.service";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";

interface PracticeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  subjectId: number;
  loId?: number;
  difficulty?: "easy" | "medium" | "hard";
  totalQuestions?: number;
}

interface QuestionResult {
  questionId: number;
  selectedAnswerId: number | null;
  isCorrect: boolean;
  timeSpent: number;
}

const difficultyConfig = {
  easy: { label: "Dễ", color: "text-green-600", bgColor: "bg-green-50" },
  medium: { label: "Trung bình", color: "text-yellow-600", bgColor: "bg-yellow-50" },
  hard: { label: "Khó", color: "text-red-600", bgColor: "bg-red-50" },
};

export function PracticeQuizModal({
  isOpen,
  onClose,
  userId,
  subjectId,
  loId,
  difficulty,
  totalQuestions = 10,
}: PracticeQuizModalProps) {
  const [practiceData, setPracticeData] = useState<GeneratePracticeResponse["data"] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = practiceData?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (practiceData?.questions.length || 0) - 1;
  const progress = practiceData ? ((currentQuestionIndex + 1) / practiceData.questions.length) * 100 : 0;

  const generatePractice = async () => {
    try {
      setIsLoading(true);
      
      const response = await practiceRecommendationService.generatePractice({
        user_id: userId,
        subject_id: subjectId,
        lo_id: loId,
        difficulty: difficulty,
        total_questions: totalQuestions,
      });

      setPracticeData(response.data);
      setCurrentQuestionIndex(0);
      setSelectedAnswerId(null);
      setResults([]);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error("Error generating practice:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tạo bộ câu hỏi luyện tập";
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId && subjectId) {
      generatePractice();
    }
  }, [isOpen, userId, subjectId, loId, difficulty, totalQuestions]);

  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswerId(answerId);
  };

  const handleNextQuestion = () => {
    if (!currentQuestion || selectedAnswerId === null) return;

    const timeSpent = Date.now() - questionStartTime;
    const correctAnswer = currentQuestion.answers.find(a => a.iscorrect);
    const isCorrect = selectedAnswerId === correctAnswer?.answer_id;

    const result: QuestionResult = {
      questionId: currentQuestion.question_id,
      selectedAnswerId,
      isCorrect,
      timeSpent,
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerId(null);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Restore previous answer if exists
      const previousResult = results[currentQuestionIndex - 1];
      if (previousResult) {
        setSelectedAnswerId(previousResult.selectedAnswerId);
      } else {
        setSelectedAnswerId(null);
      }
    }
  };

  const handleRestart = () => {
    generatePractice();
  };

  const handleSubmitResults = async () => {
    try {
      setIsSubmitting(true);
      
      // TODO: Submit results to backend
      const correctAnswers = results.filter(r => r.isCorrect).length;
      const accuracy = (correctAnswers / results.length) * 100;
      
      showSuccessToast(
        `Hoàn thành luyện tập! Độ chính xác: ${accuracy.toFixed(1)}%`
      );
      
      onClose();
    } catch (error) {
      console.error("Error submitting results:", error);
      showErrorToast("Không thể lưu kết quả luyện tập");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Đang tạo bộ câu hỏi luyện tập...
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-muted-foreground">Vui lòng chờ trong giây lát...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showResult && practiceData) {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const accuracy = (correctAnswers / results.length) * 100;
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTimePerQuestion = totalTime / results.length / 1000; // seconds

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Kết quả Luyện tập
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Câu đúng</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{accuracy.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{avgTimePerQuestion.toFixed(1)}s</div>
                <div className="text-sm text-muted-foreground">TB/câu</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{practiceData.meta.review_count}</div>
                <div className="text-sm text-muted-foreground">Câu ôn tập</div>
              </div>
            </div>

            {/* Practice Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Thông tin luyện tập</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">LO ID:</span>
                  <span className="ml-2 font-medium">{practiceData.lo_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Độ khó:</span>
                  <Badge 
                    variant="outline" 
                    className={cn("ml-2", difficultyConfig[practiceData.difficulty_source].color)}
                  >
                    {difficultyConfig[practiceData.difficulty_source].label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Phân phối:</span>
                  <span className="ml-2 text-xs">
                    Dễ: {practiceData.composition.easy}, 
                    TB: {practiceData.composition.medium}, 
                    Khó: {practiceData.composition.hard}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleRestart}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Luyện tập lại
              </Button>
              <Button onClick={handleSubmitResults} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Hoàn thành
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!practiceData || !currentQuestion) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lỗi tạo bộ câu hỏi</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Không thể tạo bộ câu hỏi luyện tập. Vui lòng thử lại.
            </p>
            <Button onClick={generatePractice}>Thử lại</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Luyện tập - Câu {currentQuestionIndex + 1}/{practiceData.questions.length}
          </DialogTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <Badge 
                  variant="outline" 
                  className={cn(difficultyConfig[currentQuestion.difficulty].color)}
                >
                  {difficultyConfig[currentQuestion.difficulty].label}
                </Badge>
                {currentQuestion.review && (
                  <Badge variant="secondary" className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Ôn tập
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Câu {currentQuestionIndex + 1}/{practiceData.questions.length}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question_text}</h3>
          </div>

          {/* Answers */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <button
                key={answer.answer_id}
                onClick={() => handleAnswerSelect(answer.answer_id)}
                className={cn(
                  "w-full p-4 text-left border rounded-lg transition-colors",
                  selectedAnswerId === answer.answer_id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2",
                      selectedAnswerId === answer.answer_id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    )}
                  >
                    {selectedAnswerId === answer.answer_id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span>{answer.answer_text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Câu trước
            </Button>
            
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswerId === null}
            >
              {isLastQuestion ? "Hoàn thành" : "Câu tiếp"}
              {!isLastQuestion && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
