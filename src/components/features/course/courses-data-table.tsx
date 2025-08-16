"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  GraduationCap,
  BookOpen,
  Calendar,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { Skeleton } from "@/components/ui/feedback";

import { courseService } from "@/lib/services/api/course.service";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import type { CourseWithRelations } from "@/lib/types/course";
import { CourseDeleteDialog } from "@/components/features/course/CourseDeleteDialog";

interface CoursesDataTableProps {
  className?: string;
}

export function CoursesDataTable({ className }: CoursesDataTableProps) {
  const router = useRouter();
  const { getUser } = useAuthStatus();

  // State management
  const [allCourses, setAllCourses] = useState<CourseWithRelations[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithRelations[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // Dialog state
  const [courseToDelete, setCourseToDelete] =
    useState<CourseWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const ITEMS_PER_PAGE = pageSize;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter courses when search term changes
  useEffect(() => {
    filterCourses(debouncedSearchTerm);
  }, [debouncedSearchTerm, allCourses]);

  // Filter courses based on search term
  const filterCourses = (search: string) => {
    if (!search.trim()) {
      setFilteredCourses(allCourses);
      setTotalItems(allCourses.length);
      setTotalPages(Math.ceil(allCourses.length / ITEMS_PER_PAGE));
    } else {
      const filtered = allCourses.filter(
        (course) =>
          course.name.toLowerCase().includes(search.toLowerCase()) ||
          course.description?.toLowerCase().includes(search.toLowerCase()) ||
          course.Program?.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCourses(filtered);
      setTotalItems(filtered.length);
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    }
    setCurrentPage(1);
  };

  // Get courses for current page
  const getCurrentPageCourses = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, endIndex);
  };

  // Fetch courses data
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const currentUser = getUser();

      if (!currentUser?.user_id) {
        toast.error("Không thể xác định thông tin người dùng");
        return;
      }

      // Get all courses and filter by current teacher
      const response = await courseService.getCourses({
        page: 1,
        limit: 1000, // Get a large number to get all courses
      });

      console.log("API Response:", response);
      console.log("Response success:", response.success);
      console.log("Response data:", response.data);

      if (response.success && response.data) {
        // Filter courses by current teacher
        const allCoursesData = response.data.courses || [];
        const teacherCourses = allCoursesData.filter(
          (course) => course.user_id === currentUser.user_id
        );

        setAllCourses(teacherCourses);
        setFilteredCourses(teacherCourses);

        // Calculate pagination for teacher's courses
        const totalPages = Math.ceil(teacherCourses.length / ITEMS_PER_PAGE);
        setTotalPages(totalPages);
        setTotalItems(teacherCourses.length);
        setCurrentPage(1);
      } else {
        throw new Error(response.message || "Không thể tải danh sách khóa học");
      }
    } catch (error: unknown) {
      console.error("Error loading courses:", error);
      let errorMessage = "Có lỗi xảy ra khi tải danh sách khóa học";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setAllCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Load courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  // Sort courses
  const sortedCourses = useMemo(() => {
    const courses = getCurrentPageCourses();
    return [...courses].sort((a, b) => {
      let aValue: any = a[sortBy as keyof CourseWithRelations];
      let bValue: any = b[sortBy as keyof CourseWithRelations];

      // Handle nested properties
      if (sortBy === "program_name") {
        aValue = a.Program?.name || "";
        bValue = b.Program?.name || "";
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "ASC"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "ASC" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [getCurrentPageCourses(), sortBy, sortOrder]);

  // Handle selection
  const handleSelectCourse = (courseId: number, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId]);
    } else {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(
        getCurrentPageCourses().map((course) => course.course_id)
      );
    } else {
      setSelectedCourses([]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedCourses.length} khóa học đã chọn?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedCourses.map((courseId) =>
          courseService.deleteCourseById(courseId)
        )
      );
      toast.success(`Đã xóa ${selectedCourses.length} khóa học thành công`);
      setSelectedCourses([]);
      fetchCourses();
    } catch (error) {
      toast.error("Không thể xóa một số khóa học");
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const csvData = filteredCourses.map((course) => ({
      "Tên khóa học": course.name,
      "Mô tả": course.description || "",
      "Tín chỉ": course.credits || 0,
      "Học kỳ": course.semester || "",
      "Năm học": course.year || "",
      "Chương trình": course.Program?.name || "",
      "Số kết quả": course.CourseResults?.length || 0,
      "Số môn học": course.Subjects?.length || 0,
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `khoa-hoc-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Handle individual actions
  const handleView = (courseId: number) => {
    router.push(`/dashboard/teaching/courses/${courseId}`);
  };

  const handleEdit = (courseId: number) => {
    router.push(`/dashboard/teaching/courses/${courseId}?edit=true`);
  };

  const handleDelete = (courseId: number) => {
    const course = filteredCourses.find((c) => c.course_id === courseId);
    if (!course) return;

    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    // Refresh data after successful deletion
    await fetchCourses();
    setCourseToDelete(null);
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Loading skeleton
  if (loading && allCourses.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Danh sách khóa học</CardTitle>
          <CardDescription>
            Hiển thị tất cả các khóa học bạn đang giảng dạy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-80" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Danh sách khóa học</CardTitle>
        <CardDescription>
          Hiển thị tất cả các khóa học bạn đang giảng dạy ({totalItems} khóa
          học)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="25">25 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
                <SelectItem value="100">100 / trang</SelectItem>
              </SelectContent>
            </Select>

            {selectedCourses.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa ({selectedCourses.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất CSV
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedCourses.length ===
                        getCurrentPageCourses().length &&
                      getCurrentPageCourses().length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-medium"
                  >
                    Tên khóa học
                    {renderSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("program_name")}
                    className="h-auto p-0 font-medium"
                  >
                    Chương trình
                    {renderSortIcon("program_name")}
                  </Button>
                </TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Điểm TB</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-8 w-8" />
                      <p>
                        {searchTerm
                          ? `Không tìm thấy khóa học nào với từ khóa "${searchTerm}"`
                          : "Chưa có khóa học nào"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push("/dashboard/teaching/courses/create")
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo khóa học đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedCourses.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCourses.includes(course.course_id)}
                        onCheckedChange={(checked) =>
                          handleSelectCourse(
                            course.course_id,
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {course.description || "—"}
                    </TableCell>
                    <TableCell>{course.Program?.name || "—"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {course.start_date
                            ? format(new Date(course.start_date), "dd/MM/yyyy")
                            : "—"}
                        </div>
                        <div className="text-muted-foreground">
                          đến{" "}
                          {course.end_date
                            ? format(new Date(course.end_date), "dd/MM/yyyy")
                            : "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {course.CourseResults &&
                      course.CourseResults.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {(
                            course.CourseResults.reduce(
                              (sum, result) => sum + result.average_score,
                              0
                            ) / course.CourseResults.length
                          ).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {course.Subjects?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleView(course.course_id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(course.course_id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(course.course_id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <PaginationWithInfo
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalItems}
              limit={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </CardContent>

      {/* Course Delete Dialog */}
      <CourseDeleteDialog
        course={courseToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
}
