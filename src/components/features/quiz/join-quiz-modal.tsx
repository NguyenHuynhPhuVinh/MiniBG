import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/forms";
import { Label } from "@/components/ui/forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback";
import { useJoinQuiz } from "@/lib/hooks/use-join-quiz";
import { cn } from "@/lib/utils";

interface JoinQuizModalProps {
  quizId?: number;
  trigger?: React.ReactNode;
}

export const JoinQuizModal: React.FC<JoinQuizModalProps> = ({
  quizId,
  trigger,
}) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [open, setOpen] = useState(false);
  const { joinQuiz, isJoining, error } = useJoinQuiz();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Khởi tạo refs cho các input
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, digits.length);
  }, [digits.length]);

  const handleDigitChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (/^[0-9]?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);

      // Tự động chuyển đến ô tiếp theo nếu đã nhập số và không phải ô cuối
      if (value !== "" && index < digits.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Xử lý phím Backspace
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        // Nếu ô hiện tại trống và không phải ô đầu tiên, quay lại ô trước đó
        inputRefs.current[index - 1]?.focus();
      } else {
        // Xóa giá trị hiện tại
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    }
    // Xử lý phím mũi tên
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < digits.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = digits.join("");

    if (!pin || pin.length !== digits.length) {
      return;
    }

    // Truyền quizId nếu có, nếu không thì truyền null để lấy quizId từ PIN
    if (await joinQuiz(quizId || null, pin)) {
      setOpen(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Chỉ xử lý nếu paste dữ liệu là các số
    if (/^\d+$/.test(pastedData)) {
      const pastedDigits = pastedData.split("").slice(0, digits.length);
      const newDigits = [...digits];

      pastedDigits.forEach((digit, index) => {
        if (index < digits.length) {
          newDigits[index] = digit;
        }
      });

      setDigits(newDigits);

      // Focus vào ô tiếp theo sau khi paste
      const nextIndex = Math.min(pastedDigits.length, digits.length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const resetModal = () => {
    setDigits(["", "", "", "", "", ""]);
  };

  useEffect(() => {
    if (open) {
      resetModal();
      // Focus vào ô đầu tiên khi mở modal
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Nhập PIN
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-[500px] p-4 sm:p-6">
        <form
          onSubmit={handleJoinQuiz}
          className="flex flex-col space-y-4 sm:space-y-6"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl sm:text-2xl font-bold">
              Tham gia bài kiểm tra
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base mt-2">
              Nhập mã PIN do giảng viên cung cấp để tham gia bài kiểm tra.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 sm:space-y-6 py-2 sm:py-4">
            <Label
              htmlFor="pin-input"
              className="text-center text-base sm:text-lg font-medium"
            >
              Mã PIN
            </Label>
            <div
              className="flex justify-center space-x-2 sm:space-x-4"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={cn(
                    "w-10 h-12 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold rounded-md border-2 border-input focus:border-primary focus:ring-0 outline-none transition-all",
                    digit ? "bg-primary/5 border-primary/50" : "bg-background"
                  )}
                  aria-label={`Số thứ ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm sm:text-base text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isJoining || digits.some((digit) => digit === "")}
            className="w-full py-4 sm:py-6 text-base sm:text-lg font-medium mt-2 cursor-pointer"
            is3DNoLayout={true}
          >
            {isJoining ? "Đang tham gia..." : "Tham gia"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinQuizModal;
