"use client";

import { useEffect } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CreateQuizFormData } from "@/lib/types/quiz";
import { Input } from "@/components/ui/forms";
import { SubjectSelect } from "@/components/features/subject/subject-select";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/components/ui/forms";

interface BasicInfoFormProps {
  form: UseFormReturn<CreateQuizFormData>;
  onSelectSubject: (subjectId: number) => void;
}

export function BasicInfoForm({ form, onSelectSubject }: BasicInfoFormProps) {
  // Theo dõi giá trị của các trường để tự động xóa lỗi khi giá trị hợp lệ
  const subjectId = useWatch({
    control: form.control,
    name: "subject_id",
  });

  const name = useWatch({
    control: form.control,
    name: "name",
  });

  const duration = useWatch({
    control: form.control,
    name: "duration",
  });

  // Tự động xóa lỗi khi thông tin đã hợp lệ
  useEffect(() => {
    if (subjectId) {
      form.clearErrors("subject_id");
    }
  }, [subjectId, form]);

  useEffect(() => {
    if (name && name.length >= 3) {
      form.clearErrors("name");
    }
  }, [name, form]);

  useEffect(() => {
    if (duration && duration >= 1) {
      form.clearErrors("duration");
    }
  }, [duration, form]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <FormField
        control={form.control}
        name="subject_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base">Môn học</FormLabel>
            <FormControl>
              <SubjectSelect
                onValueChange={(value) => {
                  field.onChange(value);
                  onSelectSubject(value);
                }}
                value={field.value}
              />
            </FormControl>
            <FormMessage className="text-xs sm:text-sm" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base">
              Tên bài kiểm tra
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Nhập tên bài kiểm tra"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  if (e.target.value.length >= 3) {
                    form.clearErrors("name");
                  }
                }}
                className="border-2 text-sm sm:text-base"
              />
            </FormControl>
            <FormMessage className="text-xs sm:text-sm" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base">
              Thời gian làm bài (phút)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Nhập thời gian làm bài"
                {...field}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  field.onChange(value || 0);
                  if (value >= 1) {
                    form.clearErrors("duration");
                  }
                }}
                className="border-2 text-sm sm:text-base"
              />
            </FormControl>
            <FormMessage className="text-xs sm:text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}
