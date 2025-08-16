/* eslint-disable @typescript-eslint/no-unused-vars */
 
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { Loader2 } from "lucide-react";
import {
  QuizQuestionDisplay,
  QuizHeader,
  QuizCompletion,
  RoundTransition,
} from "@/components/features/quiz/live";
import { useQuizData } from "@/lib/hooks/quiz/useQuizData";
import { useQuizRounds } from "@/lib/hooks/quiz/useQuizRounds";
import { useQuizTimer } from "@/lib/hooks/quiz/useQuizTimer";
import { useQuizSocket } from "@/lib/hooks/quiz/useQuizSocket";
import { useQuizNavigation } from "@/lib/hooks/quiz/useQuizNavigation";
import { useQuizPersistence } from "@/lib/hooks/quiz/useQuizPersistence";
import { Question } from "@/lib/types/quiz";

// Cập nhật interface Question để bao gồm trường id
type QuestionWithId = Question & { id: number };

const QuizLivePage = () => {
  const { id } = useParams();
  const quizId = parseInt(id as string, 10);
  const { user } = useAuthStatus();
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Khởi tạo persistence hook
  const { saveQuizState, loadQuizState, clearAllQuizStates } =
    useQuizPersistence({
      quizId,
    });

  // Tải trạng thái đã lưu (nếu có)
  const persistedState = loadQuizState();

  // Khôi phục trạng thái từ localStorage
  useEffect(() => {
    if (persistedState) {
      console.log("Khôi phục trạng thái quiz từ localStorage:", persistedState);
      setQuizCompleted(persistedState.quizCompleted);
      setFinalScore(persistedState.finalScore);
    }
  }, []);

  // Xóa tất cả quiz states cũ khi bắt đầu quiz mới
  useEffect(() => {
    const currentPersistedState = loadQuizState();
    if (!currentPersistedState || currentPersistedState.quizId !== quizId) {
      console.log("Bắt đầu quiz mới, xóa tất cả quiz states cũ");
      clearAllQuizStates();
    }
  }, [quizId, loadQuizState, clearAllQuizStates]);

  // Sử dụng custom hooks với trạng thái khôi phục
  const { questions, loading, error, currentScore, setCurrentScore } =
    useQuizData({
      quizId,
      onScoreChange: (score) => {
        saveQuizState({ currentScore: score });
      },
      initialScore: persistedState?.currentScore,
    });

  const handleQuizComplete = useCallback(
    (finalScore: number) => {
      setFinalScore(finalScore);
      setQuizCompleted(true);
      // Xóa tất cả quiz states khi quiz hoàn thành
      clearAllQuizStates();
    },
    [clearAllQuizStates]
  );

  const {
    currentRound,
    questionsInCurrentRound,
    questionStates,
    roundHistory,
    showRoundTransition,
    canNavigateBack,
    getRoundConfig,
    moveToNextRound,
    handleMoveToNextRound,
    updateQuestionState,
    setShowRoundTransition,
  } = useQuizRounds({
    questions,
    onQuizComplete: handleQuizComplete,
    quizId,
    onStateChange: (state) => {
      saveQuizState({
        currentRound: state.currentRound,
        questionsInCurrentRound: state.questionsInCurrentRound,
        questionStates: state.questionStates,
        questionWrongHistory: state.questionWrongHistory,
        roundHistory: state.roundHistory,
        showRoundTransition: state.showRoundTransition,
        canNavigateBack: state.canNavigateBack,
      });
    },
    initialState: persistedState
      ? {
          currentRound: persistedState.currentRound,
          questionsInCurrentRound: persistedState.questionsInCurrentRound,
          questionStates: persistedState.questionStates,
          questionWrongHistory: persistedState.questionWrongHistory,
          roundHistory: persistedState.roundHistory,
          showRoundTransition: persistedState.showRoundTransition,
          canNavigateBack: persistedState.canNavigateBack,
        }
      : undefined,
  });

  const { quizTimeLeft, formatTime } = useQuizTimer({
    quizId,
    quizCompleted,
    onTimeUp: () => {
      setQuizCompleted(true);
      clearAllQuizStates();
    },
    onTimeChange: (timeLeft) => {
      saveQuizState({ quizTimeLeft: timeLeft });
    },
    initialTimeLeft: persistedState?.quizTimeLeft,
  });

  const { userPosition, totalParticipants, updateUserPosition } = useQuizSocket(
    {
      quizId,
      user,
      questionsLength: questions.length,
    }
  );

  const {
    currentQuestionIndex,
    handlePrevQuestion,
    handleNextQuestion,
    canMoveToNextRound,
    handleAnswerSubmit,
  } = useQuizNavigation({
    questionsInCurrentRound,
    canNavigateBack,
    questionStates,
    onMoveToNextRound: handleMoveToNextRound,
    moveToNextRound,
    questionsLength: questions.length,
    currentRound,
    onNavigationChange: (questionIndex) => {
      saveQuizState({ currentQuestionIndex: questionIndex });
    },
    initialCurrentQuestionIndex: persistedState?.currentQuestionIndex,
  });

  // Lưu trạng thái quiz completion
  useEffect(() => {
    saveQuizState({
      quizCompleted,
      finalScore,
    });
  }, [quizCompleted, finalScore, saveQuizState]);

  // Tính điểm hiện tại
  useEffect(() => {
    if (questions.length > 0) {
      // Tính điểm tổng từ tất cả các vòng
      const totalCorrectAnswers = Object.values(questionStates).filter(
        (state) => state.isCorrect === true
      ).length;
      setCurrentScore(totalCorrectAnswers);
    }
  }, [questionStates, questions.length, setCurrentScore]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Hiển thị hoàn thành quiz
  if (quizCompleted) {
    const totalCorrectAnswers = Object.values(questionStates).filter(
      (state) => state.isCorrect === true
    ).length;
    const totalQuestions = questions.length;
    const scorePercentage = finalScore || 0;

    return (
      <QuizCompletion
        finalScore={scorePercentage}
        correctAnswers={totalCorrectAnswers}
        totalQuestions={totalQuestions}
        quizId={quizId}
        roundHistory={roundHistory}
      />
    );
  }

  // Hiển thị round transition
  if (showRoundTransition) {
    const previousRoundStats =
      roundHistory.length > 0
        ? {
            attempted:
              roundHistory[roundHistory.length - 1].questionsAttempted.length,
            correct: roundHistory[roundHistory.length - 1].correctAnswers,
            incorrect: roundHistory[roundHistory.length - 1].incorrectAnswers,
          }
        : undefined;

    return (
      <RoundTransition
        visible={showRoundTransition}
        currentRound={currentRound}
        roundConfig={getRoundConfig(currentRound)}
        questionsInRound={questionsInCurrentRound.length}
        previousRoundStats={previousRoundStats}
        onComplete={() => setShowRoundTransition(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 relative">
      {/* Header sử dụng component riêng */}
      <QuizHeader
        currentQuestionIndex={questionsInCurrentRound.indexOf(
          currentQuestionIndex
        )}
        totalQuestions={questionsInCurrentRound.length}
        currentScore={currentScore}
        totalQuestionsOverall={questions.length}
        quizTimeLeft={quizTimeLeft}
        onPrevQuestion={handlePrevQuestion}
        onNextQuestion={handleNextQuestion}
        formatTime={formatTime}
        userPosition={userPosition}
        totalParticipants={totalParticipants}
        // Thêm props cho round
        currentRound={currentRound}
        roundConfig={getRoundConfig(currentRound)}
        canNavigateBack={canNavigateBack}
        // Thêm props cho chuyển vòng
        canMoveToNextRound={canMoveToNextRound()}
        onMoveToNextRound={handleMoveToNextRound}
      />

      {questions.length > 0 &&
      questionsInCurrentRound.length > 0 &&
      questionsInCurrentRound.includes(currentQuestionIndex) &&
      questions[currentQuestionIndex] ? (
        <div className="mt-16">
          <QuizQuestionDisplay
            key={`${questions[currentQuestionIndex].question_id}-${currentQuestionIndex}-round-${currentRound}`}
            question={questions[currentQuestionIndex]}
            quizId={Number(id)}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            answered={questionStates[currentQuestionIndex]?.isAnswered ?? false}
            selectedAnswer={
              questionStates[currentQuestionIndex]?.selectedAnswer ?? null
            }
            isCorrect={questionStates[currentQuestionIndex]?.isCorrect ?? false}
            currentRound={currentRound}
            roundAnswered={
              questionStates[currentQuestionIndex]?.roundAnswered ?? 0
            }
            onAnswer={async (selectedAnswer, isCorrect) => {
              // Cập nhật trạng thái câu hỏi
              updateQuestionState(
                currentQuestionIndex,
                selectedAnswer,
                isCorrect,
                currentRound
              );

              // Xử lý logic trả lời câu hỏi
              handleAnswerSubmit(selectedAnswer, isCorrect, updateUserPosition);
            }}
          />
        </div>
      ) : (
        <div>Không có câu hỏi nào</div>
      )}
    </div>
  );
};

export default QuizLivePage;
