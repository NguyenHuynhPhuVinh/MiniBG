import { ReactNode } from "react";
import { Button } from "@/components/ui/forms";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/layout";

interface QuizStepContentProps {
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  isLoading?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showSubmitButton?: boolean;
  isNextDisabled?: boolean;
  isSubmitDisabled?: boolean;
  error?: string | null;
}

export function QuizStepContent({
  children,
  onNext,
  onBack,
  onSubmit,
  nextLabel = "Tiếp theo",
  backLabel = "Quay lại",
  submitLabel = "Tạo bài kiểm tra",
  isLoading = false,
  showBackButton = true,
  showNextButton = true,
  showSubmitButton = false,
  isNextDisabled = false,
  isSubmitDisabled = false,
  error = null,
}: QuizStepContentProps) {
  return (
    <Card className="border-2 sm:border-4 max-w-3xl mx-auto overflow-hidden">
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="space-y-4 sm:space-y-6">{children}</div>

        {error && (
          <div className="p-2 sm:p-3 rounded-md bg-destructive/10 text-destructive text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 border-t border-border/60 gap-3 sm:gap-0">
          {showBackButton ? (
            <Button
              variant="outline"
              onClick={onBack}
              className="h-10 sm:h-12 cursor-pointer w-full sm:w-auto"
              size="lg"
            >
              <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
              {backLabel}
            </Button>
          ) : (
            <div className="hidden sm:block"></div>
          )}

          <div className="flex gap-2 w-full sm:w-auto">
            {showNextButton && (
              <Button
                onClick={onNext}
                disabled={isNextDisabled}
                className="h-10 sm:h-12 cursor-pointer flex-1 sm:flex-none"
                size="lg"
              >
                {nextLabel}
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1.5" />
              </Button>
            )}

            {showSubmitButton && (
              <Button
                onClick={onSubmit}
                disabled={isSubmitDisabled || isLoading}
                className="h-10 sm:h-12 relative cursor-pointer flex-1 sm:flex-none"
                size="lg"
                is3DNoLayout={true}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin absolute left-2" />
                )}
                <span className={isLoading ? "ml-4" : ""}>{submitLabel}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
