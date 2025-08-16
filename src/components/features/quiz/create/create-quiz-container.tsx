"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuizFormData } from "@/lib/types/quiz";
import { createQuizSchema } from "@/lib/validations/quiz";
import { useQuizCreation } from "@/lib/hooks/use-quiz-creation";
import { BasicInfoForm } from "../forms/basic-info-form";
import { QuestionCriteriaForm } from "../forms/question-criteria-form";
import { QuizLoSelection } from "../forms/quiz-lo-selection";
import { Form } from "@/components/ui/forms";
import { QuizProgressBar } from "./quiz-progress-bar";
import { QuizStepContent } from "./quiz-step-content";
import { showInfoToast } from "@/lib/utils/toast-utils";

// Move steps constant outside component to avoid recreation on each render
const QUIZ_CREATION_STEPS = [
  {
    id: "basic-info",
    title: "Thông tin cơ bản",
    description: "Tên và thời gian",
  },
  {
    id: "lo-selection",
    title: "Mục tiêu học tập",
    description: "Chọn nội dung",
  },
  {
    id: "question-criteria",
    title: "Tiêu chí câu hỏi",
    description: "Số lượng và độ khó",
  },
];

export function CreateQuizContainer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("basic-info");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
  const { createQuiz, isLoading, error } = useQuizCreation();

  const form = useForm<CreateQuizFormData>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      name: "",
      duration: 30,
      question_criteria: {
        loIds: [],
        totalQuestions: 10,
        difficultyRatio: {
          easy: 30,
          medium: 40,
          hard: 30,
        },
        type: undefined,
      },
    },
  });

  // Xử lý khi chọn môn học
  const handleSubjectSelect = (id: number) => {
    setSelectedSubjectId(id);
    form.setValue("subject_id", id);
  };

  // Kiểm tra và xử lý hoàn thành bước
  const validateAndCompleteStep = (stepId: string): boolean => {
    if (stepId === "basic-info") {
      const { subject_id, name, duration } = form.getValues();

      if (!subject_id) {
        form.setError("subject_id", { message: "Vui lòng chọn môn học" });
        return false;
      }

      if (!name || name.length < 3) {
        form.setError("name", {
          message: "Tên bài kiểm tra phải có ít nhất 3 ký tự",
        });
        return false;
      }

      if (!duration || duration < 1) {
        form.setError("duration", { message: "Thời gian tối thiểu là 1 phút" });
        return false;
      }

      // Hoàn thành bước
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "lo-selection") {
      const { question_criteria } = form.getValues();

      if (!question_criteria.loIds || question_criteria.loIds.length === 0) {
        showInfoToast("Vui lòng chọn ít nhất một mục tiêu học tập");
        return false;
      }

      // Hoàn thành bước
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    if (stepId === "question-criteria") {
      const { question_criteria } = form.getValues();
      const { totalQuestions, difficultyRatio } = question_criteria;

      if (!totalQuestions || totalQuestions < 1) {
        showInfoToast("Số lượng câu hỏi phải ít nhất là 1");
        return false;
      }

      const total =
        difficultyRatio.easy + difficultyRatio.medium + difficultyRatio.hard;
      if (total !== 100) {
        showInfoToast(
          `Tổng tỷ lệ độ khó phải bằng 100%, hiện tại là ${total}%`
        );
        return false;
      }

      // Hoàn thành bước
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps((prev) => [...prev, stepId]);
      }
      return true;
    }

    return false;
  };

  // Xử lý nút tiếp theo
  const handleNext = () => {
    const isValid = validateAndCompleteStep(currentStep);
    if (!isValid) return;

    const currentIndex = QUIZ_CREATION_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex < QUIZ_CREATION_STEPS.length - 1) {
      setCurrentStep(QUIZ_CREATION_STEPS[currentIndex + 1].id);
    }
  };

  // Xử lý nút quay lại
  const handleBack = () => {
    const currentIndex = QUIZ_CREATION_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex > 0) {
      setCurrentStep(QUIZ_CREATION_STEPS[currentIndex - 1].id);
    }
  };

  // Xử lý tạo bài kiểm tra
  const handleSubmit = async () => {
    const isValid = validateAndCompleteStep("question-criteria");
    if (!isValid) return;

    const result = await createQuiz(form.getValues());
    if (result) {
      router.push("/dashboard/teaching/quizzes");
    }
  };

  // Render theo bước hiện tại
  const renderStepContent = () => {
    switch (currentStep) {
      case "basic-info":
        return (
          <QuizStepContent
            onNext={handleNext}
            showBackButton={false}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Thông tin cơ bản
            </h2>
            <BasicInfoForm form={form} onSelectSubject={handleSubjectSelect} />
          </QuizStepContent>
        );

      case "lo-selection":
        return (
          <QuizStepContent
            onNext={handleNext}
            onBack={handleBack}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Mục tiêu học tập
            </h2>
            {selectedSubjectId && (
              <QuizLoSelection subjectId={selectedSubjectId} form={form} />
            )}
          </QuizStepContent>
        );

      case "question-criteria":
        return (
          <QuizStepContent
            onBack={handleBack}
            onSubmit={handleSubmit}
            showNextButton={false}
            showSubmitButton={true}
            isLoading={isLoading}
            error={error}
          >
            <h2 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4">
              Tiêu chí câu hỏi
            </h2>
            <QuestionCriteriaForm form={form} />
          </QuizStepContent>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6 px-2 sm:px-4 md:px-6">
        <QuizProgressBar
          steps={QUIZ_CREATION_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
        {renderStepContent()}
      </div>
    </Form>
  );
}
