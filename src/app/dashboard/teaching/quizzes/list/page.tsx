"use client";

import { useState, useEffect, useCallback } from "react";
import { quizService, subjectService } from "@/lib/services/api";
import {
  Quiz,
  Subject,
  QuizListResponse,
  QuizFilterParams,
} from "@/lib/types/quiz";
import { Loader2 } from "lucide-react";
import { QuizSearch } from "@/components/features/quiz/list/quiz-search";
import { QuizGrid } from "@/components/features/quiz/list/quiz-grid";
import { QuizEmptyState } from "@/components/features/quiz/list/quiz-empty-state";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { showErrorToast } from "@/lib/utils/toast-utils";

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination and filter states
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFilters] = useState<QuizFilterParams>({
    page: 1,
    limit: 12,
    status: "",
    subject_id: undefined,
    search: "",
    sort_by: "update_time",
    sort_order: "DESC",
  });

  // Hàm lấy tên môn học từ subject_id
  const getSubjectName = (subjectId: number) => {
    const subject = subjects.find((s) => s.subject_id === subjectId);
    return subject ? subject.name : `Môn học #${subjectId}`;
  };

  // Fetch quizzes with pagination and filters
  const fetchQuizzes = useCallback(async (params: QuizFilterParams) => {
    try {
      setIsLoading(true);
      const response = await quizService.getQuizzes(params);

      console.log("Quiz API Response:", response); // Debug log

      // Xử lý response với wrapper success/data
      if (response?.success && response?.data) {
        setQuizzes(response.data.quizzes || []);
        setPagination(
          response.data.pagination || {
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 12,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } else {
        console.warn("Unexpected response structure:", response);
        setQuizzes([]);
        setPagination({
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 12,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quiz:", error);
      showErrorToast("Không thể tải danh sách bài kiểm tra");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const subjectsResponse = await subjectService.getSubjects();

      console.log("Subjects API Response:", subjectsResponse); // Debug log

      // Xử lý response với wrapper success/data
      if (subjectsResponse?.success && subjectsResponse?.data) {
        setSubjects(subjectsResponse.data.subjects || []);
      } else {
        console.warn(
          "Unexpected subjects response structure:",
          subjectsResponse
        );
        setSubjects([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Fetch quizzes when filters change
  useEffect(() => {
    fetchQuizzes(filters);
  }, [filters, fetchQuizzes]);

  // Handler functions
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setFilters((prev) => ({
      ...prev,
      search,
      page: 1, // Reset to first page when searching
    }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleSubjectChange = (subject_id: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      subject_id,
      page: 1,
    }));
  };

  const handleSortByChange = (sort_by: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by,
    }));
  };

  const handleSortOrderChange = (sort_order: "ASC" | "DESC") => {
    setFilters((prev) => ({
      ...prev,
      sort_order,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      limit: 12,
      status: "",
      subject_id: undefined,
      search: "",
      sort_by: "update_time",
      sort_order: "DESC",
    });
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <QuizSearch
        searchTerm={searchTerm}
        onChange={handleSearchChange}
        total={pagination.total}
        status={filters.status}
        onStatusChange={handleStatusChange}
        subjectId={filters.subject_id}
        onSubjectChange={handleSubjectChange}
        subjects={subjects}
        sortBy={filters.sort_by || "update_time"}
        onSortByChange={handleSortByChange}
        sortOrder={filters.sort_order || "DESC"}
        onSortOrderChange={handleSortOrderChange}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          <span className="ml-2 sm:ml-3 text-base sm:text-lg">
            Đang tải dữ liệu...
          </span>
        </div>
      ) : quizzes.length === 0 ? (
        <QuizEmptyState
          isSearching={
            !!filters.search || !!filters.status || !!filters.subject_id
          }
        />
      ) : (
        <>
          <QuizGrid quizzes={quizzes} getSubjectName={getSubjectName} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <PaginationWithInfo
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
                className="justify-center"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
