"use client";

import { useState, useEffect } from "react";
import { subjectService } from "@/lib/services/api";
import { Subject } from "@/lib/types/quiz";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";

interface SubjectSelectProps {
  onValueChange: (value: number) => void;
  value?: number;
  disabled?: boolean;
}

export function SubjectSelect({
  onValueChange,
  value,
  disabled = false,
}: SubjectSelectProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách môn học khi component được tạo
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const response = await subjectService.getSubjects();

        // Xử lý response với wrapper success/data
        if (response?.success && response?.data) {
          setSubjects(response.data.subjects || []);
        } else {
          console.warn("Unexpected subjects response structure:", response);
          setSubjects([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Xử lý sự kiện khi chọn môn học
  const handleSubjectChange = (valueStr: string) => {
    const subjectId = parseInt(valueStr, 10);
    onValueChange(subjectId);
  };

  return (
    <Select
      disabled={isLoading || disabled}
      onValueChange={handleSubjectChange}
      value={value?.toString()}
    >
      <SelectTrigger>
        <SelectValue placeholder="Chọn môn học" />
      </SelectTrigger>
      <SelectContent>
        {subjects.map((subject) => (
          <SelectItem
            key={subject.subject_id}
            value={subject.subject_id.toString()}
          >
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
