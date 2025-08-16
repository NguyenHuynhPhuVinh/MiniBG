"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { BookOpen, Calendar, GraduationCap, User, Clock } from "lucide-react";
import { CourseWithRelations } from "@/lib/types/course";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CourseOverviewProps {
  course: CourseWithRelations;
}

export function CourseOverview({ course }: CourseOverviewProps) {
  // No need for additional API calls since course data is already loaded
  const isLoading = false;

  return (
    <div className="space-y-6">
      {/* Course Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Thông tin khóa học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên khóa học
                </label>
                <p className="text-lg font-semibold">{course.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </label>
                <p className="text-sm">
                  {course.description || "Chưa có mô tả"}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Giảng viên
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {course.User?.name || "Chưa phân công"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Chương trình đào tạo
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {course.Program?.name || "Chưa xác định"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ngày bắt đầu
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {course.start_date
                      ? format(new Date(course.start_date), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ngày kết thúc
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {course.end_date
                      ? format(new Date(course.end_date), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tổng môn học
          </CardTitle>
        </CardHeader>
        <CardContent>
          {course.Subjects && course.Subjects.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Đã thiết lập
                </span>
                <Badge variant="secondary">
                  {course.Subjects.length} môn học
                </Badge>
              </div>
              <div className="space-y-2">
                {course.Subjects.slice(0, 3).map((subject) => (
                  <div
                    key={subject.subject_id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm font-medium">{subject.name}</span>
                    <Badge variant="outline" className="text-xs">
                      ID: {subject.subject_id}
                    </Badge>
                  </div>
                ))}
                {course.Subjects.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    và {course.Subjects.length - 3} môn học khác...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Chưa có môn học nào được thiết lập</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
