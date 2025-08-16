/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreateQuizFormData, QuestionType } from "@/lib/types/quiz";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Slider } from "@/components/ui/forms";
import { Card, CardContent } from "@/components/ui/layout";

interface QuestionCriteriaFormProps {
  form: UseFormReturn<CreateQuizFormData>;
}

export function QuestionCriteriaForm({ form }: QuestionCriteriaFormProps) {
  // Tham chiếu để tránh cập nhật vòng lặp vô hạn
  const isUpdatingRef = useRef(false);

  // Theo dõi giá trị của các trường để tự động xóa lỗi khi đã hợp lệ
  const totalQuestions = useWatch({
    control: form.control,
    name: "question_criteria.totalQuestions",
  });

  const difficultyRatio = useWatch({
    control: form.control,
    name: "question_criteria.difficultyRatio",
  });

  // Tự động xóa lỗi khi giá trị đã hợp lệ
  useEffect(() => {
    if (totalQuestions && totalQuestions >= 1) {
      form.clearErrors("question_criteria.totalQuestions");
    }
  }, [totalQuestions, form]);

  useEffect(() => {
    if (difficultyRatio) {
      const total =
        difficultyRatio.easy + difficultyRatio.medium + difficultyRatio.hard;
      if (total === 100) {
        form.clearErrors("question_criteria.difficultyRatio");
      }
    }
  }, [difficultyRatio, form]);

  // Xử lý thay đổi tỷ lệ độ khó
  const handleDifficultyChange = (
    level: "easy" | "medium" | "hard",
    value: number
  ) => {
    // Tránh cập nhật đồng thời nhiều lần
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      // Lấy giá trị hiện tại
      const current = form.getValues().question_criteria.difficultyRatio;

      // Tính tổng hiện tại
      const total = current.easy + current.medium + current.hard;

      // Tính mức chênh lệch giữa giá trị mới và giá trị cũ
      const diff = value - current[level];

      // Nếu giá trị tăng và tổng mới vượt quá 100%, cần điều chỉnh các giá trị khác
      if (diff > 0 && total + diff > 100) {
        // Tính toán phần cần giảm
        const excess = total + diff - 100;

        // Phân bổ phần giảm vào các mức độ khác
        const otherLevels = ["easy", "medium", "hard"].filter(
          (l) => l !== level
        ) as Array<"easy" | "medium" | "hard">;

        // Ưu tiên giảm từ mức có giá trị cao hơn
        otherLevels.sort((a, b) => current[b] - current[a]);

        let remainingExcess = excess;

        for (const otherLevel of otherLevels) {
          if (remainingExcess <= 0) break;

          const currentValue = current[otherLevel];
          const newValue = Math.max(0, currentValue - remainingExcess);

          // Cập nhật giá trị trên form
          form.setValue(
            `question_criteria.difficultyRatio.${otherLevel}`,
            newValue
          );
          remainingExcess -= currentValue - newValue;
        }
      }
      // Nếu giá trị giảm, phân phối vào các mức khác
      else if (diff < 0) {
        // Số % được giải phóng
        const released = Math.abs(diff);

        // Phân phối vào các mức khác theo tỷ lệ
        const otherLevels = ["easy", "medium", "hard"].filter(
          (l) => l !== level
        ) as Array<"easy" | "medium" | "hard">;

        // Ưu tiên phân phối theo tỷ lệ hiện tại
        const otherSum = otherLevels.reduce((sum, lv) => sum + current[lv], 0);

        if (otherSum > 0) {
          for (const otherLevel of otherLevels) {
            // Phân phối theo tỷ lệ
            const ratio = current[otherLevel] / otherSum;
            const addition = Math.round(released * ratio);

            // Cập nhật giá trị
            form.setValue(
              `question_criteria.difficultyRatio.${otherLevel}`,
              current[otherLevel] + addition
            );
          }
        } else {
          // Nếu các mức khác đều là 0, phân phối đều
          const addition = Math.floor(released / otherLevels.length);
          for (const otherLevel of otherLevels) {
            form.setValue(
              `question_criteria.difficultyRatio.${otherLevel}`,
              current[otherLevel] + addition
            );
          }
        }
      }

      // Cập nhật giá trị mới cho level hiện tại
      form.setValue(`question_criteria.difficultyRatio.${level}`, value);

      // Kiểm tra tổng sau khi cập nhật
      const updatedValues = form.getValues().question_criteria.difficultyRatio;
      const newTotal =
        updatedValues.easy + updatedValues.medium + updatedValues.hard;

      // Nếu tổng vẫn chưa đạt 100, điều chỉnh giá trị của mức cuối cùng
      if (newTotal !== 100) {
        // Tạo mảng sắp xếp theo giá trị
        const difficultyLevels: Array<"easy" | "medium" | "hard"> = [
          "easy",
          "medium",
          "hard",
        ];

        // Sắp xếp để tìm mức cao nhất
        difficultyLevels.sort((a, b) => updatedValues[b] - updatedValues[a]);

        // Lấy mức cao nhất
        const highestLevel = difficultyLevels[0];

        const adjustedValue = updatedValues[highestLevel] + (100 - newTotal);
        form.setValue(
          `question_criteria.difficultyRatio.${highestLevel}`,
          adjustedValue
        );
      }

      // Xóa lỗi nếu tổng = 100
      if (Math.abs(newTotal - 100) < 0.001) {
        form.clearErrors("question_criteria.difficultyRatio");
      }
    } finally {
      // Đảm bảo luôn được reset để tránh bị khóa
      isUpdatingRef.current = false;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="w-full">
        <FormField
          control={form.control}
          name="question_criteria.totalQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">
                Số lượng câu hỏi
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Nhập số lượng câu hỏi"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    field.onChange(value || 0);
                    if (value >= 1) {
                      form.clearErrors("question_criteria.totalQuestions");
                    }
                  }}
                  className="text-sm sm:text-base"
                />
              </FormControl>
              <FormDescription className="text-xs sm:text-sm">
                Nhập số lượng câu hỏi cho bài kiểm tra
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm sm:text-base font-medium">Tỷ lệ độ khó</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tổng:{" "}
              {difficultyRatio?.easy +
                difficultyRatio?.medium +
                difficultyRatio?.hard || 0}
              %
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="question_criteria.difficultyRatio.easy"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm sm:text-base">Dễ</FormLabel>
                    <span className="text-xs sm:text-sm">{field.value}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(values) => {
                        handleDifficultyChange("easy", values[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_criteria.difficultyRatio.medium"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm sm:text-base">
                      Trung bình
                    </FormLabel>
                    <span className="text-xs sm:text-sm">{field.value}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(values) => {
                        handleDifficultyChange("medium", values[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_criteria.difficultyRatio.hard"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm sm:text-base">Khó</FormLabel>
                    <span className="text-xs sm:text-sm">{field.value}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={[field.value]}
                      onValueChange={(values) => {
                        handleDifficultyChange("hard", values[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.question_criteria?.difficultyRatio
              ?.message && (
              <p className="text-sm text-destructive">
                {
                  form.formState.errors.question_criteria.difficultyRatio
                    .message
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
