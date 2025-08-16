import React from "react";
import { Button } from "@/components/ui/forms";
import { Copy, Play } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TeacherOnly } from "@/components/features/auth/role-guard";

interface QuizPinDisplayProps {
  pin: string;
  quizName: string;
  onStartQuiz: () => void;
  disabled?: boolean;
}

export const QuizPinDisplay: React.FC<QuizPinDisplayProps> = ({
  pin,
  quizName,
  onStartQuiz,
  disabled = false,
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(pin);
    toast.success("Đã sao chép mã PIN vào clipboard");
  };

  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-6 md:mb-10">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 line-clamp-2">
        {quizName}
      </h1>

      <div className="flex flex-col items-center mb-4 md:mb-8">
        <p className="text-base md:text-lg text-muted-foreground mb-2 md:mb-4">
          Mã PIN
        </p>

        <div className="flex justify-center space-x-2 md:space-x-4 mb-4 md:mb-6">
          {pin.split("").map((digit, index) => (
            <div
              key={index}
              className={cn(
                "w-8 h-10 sm:w-12 sm:h-14 md:w-14 md:h-16 flex items-center justify-center rounded-md text-center text-xl sm:text-2xl md:text-3xl font-bold border-2",
                "bg-primary/5 border-primary/50"
              )}
            >
              {digit}
            </div>
          ))}
        </div>

        <TeacherOnly>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="mb-2 md:mb-4 cursor-pointer text-xs sm:text-sm"
            aria-label="Sao chép mã PIN"
          >
            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Sao chép mã PIN
          </Button>

          <Button
            onClick={onStartQuiz}
            disabled={disabled}
            className="mt-2 md:mt-4 px-4 sm:px-6 md:px-8 py-2 sm:py-4 md:py-6 cursor-pointer text-sm sm:text-base"
            size="lg"
            is3DNoLayout={true}
          >
            <Play className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Bắt đầu bài kiểm tra
          </Button>
        </TeacherOnly>
      </div>
    </div>
  );
};

export default QuizPinDisplay;
