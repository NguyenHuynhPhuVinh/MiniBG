"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { quizService } from "@/lib/services/api";
import {
  Loader2,
  FileDown,
  ChevronLeft,
  BarChart3,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Grid3X3,
  Users,
  BookOpen,
  Radar,
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import { Input } from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import { formatDate } from "@/lib/utils";
import { exportToExcel } from "@/lib/utils/export-utils";

import {
  TimeSeriesChart,
  AdvancedScoreDistributionChart,
  CompletionFunnelChart,
  TimeScoreCorrelationChart,
} from "@/components/features/charts";

// New chapter analytics components
import {
  LearningOutcomesChart,
  DifficultyLOHeatmap,
} from "@/components/features/charts";
import StudentGroupBarChart from "@/components/features/charts/StudentGroupBarChart";
import TeacherRadarChart from "@/components/features/charts/TeacherRadarChart";

export default function QuizResultsReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId")
    ? parseInt(searchParams.get("quizId") as string)
    : null;
  const quizName = searchParams.get("quizName") || "Bài kiểm tra";

  interface QuizResult {
    result_id: number;
    score: number;
    status: string;
    completion_time?: number;
    update_time?: string;
    Student?: {
      user_id?: string;
      name?: string;
      email?: string;
    };
    lo_chapters?: Array<{
      lo_id: number;
      lo_name: string;
      chapters: Array<{
        chapter_id: number;
        chapter_name: string;
        sections: Array<{
          section_id: number;
          title: string;
          content: string;
          order: number;
        }>;
      }>;
    }>;
  }

  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!quizId) {
        setError("Không tìm thấy ID bài kiểm tra");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await quizService.getQuizResultsByQuizId(quizId);
        console.log("Quiz Results Reports API Response:", response);

        // Xử lý wrapper nếu có, fallback cho cấu trúc cũ
        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data)
        ) {
          // Cấu trúc mới với wrapper
          setResults(response.data);
        } else if (Array.isArray(response)) {
          // Cấu trúc cũ - array trực tiếp
          setResults(response);
        } else {
          console.warn(
            "Unexpected quiz results reports response structure:",
            response
          );
          setResults([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy kết quả bài kiểm tra:", error);
        setError("Không thể lấy kết quả bài kiểm tra. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizResults();
  }, [quizId]);

  // Hàm phân loại học lực dựa trên điểm số
  const getGradeClassification = (score: number): string => {
    if (score >= 9) return "xuất sắc";
    if (score >= 8) return "giỏi";
    if (score >= 6.5) return "khá";
    if (score >= 5) return "trung bình";
    if (score >= 3.5) return "yếu";
    return "kém";
  };

  // Lọc kết quả theo tìm kiếm và phân loại học lực
  const filteredResults = results.filter((result) => {
    const studentName = result.Student?.name?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = studentName.includes(searchLower);

    if (gradeFilter === "all") {
      return nameMatch;
    }

    const gradeClassification = getGradeClassification(result.score);
    return nameMatch && gradeClassification === gradeFilter;
  });

  // Xuất dữ liệu ra file Excel
  const handleExportToExcel = () => {
    try {
      const dataToExport = filteredResults.map((result) => ({
        "Mã học viên": result.Student?.user_id || "N/A",
        "Tên học viên": result.Student?.name || "N/A",
        Email: result.Student?.email || "N/A",
        "Điểm số": result.score,
        "Phân loại": getGradeClassification(result.score).toUpperCase(),
        "Trạng thái": result.status,
        "Thời gian hoàn thành (giây)": result.completion_time || "N/A",
        "Ngày cập nhật": result.update_time
          ? formatDate(result.update_time)
          : "N/A",
      }));

      // Tạo thông tin bổ sung cho báo cáo
      const currentDate = new Date();
      const formattedDate = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(currentDate);

      // Tạo thống kê theo phân loại
      const gradeStats = {
        "xuất sắc": filteredResults.filter(
          (r) => getGradeClassification(r.score) === "xuất sắc"
        ).length,
        giỏi: filteredResults.filter(
          (r) => getGradeClassification(r.score) === "giỏi"
        ).length,
        khá: filteredResults.filter(
          (r) => getGradeClassification(r.score) === "khá"
        ).length,
        "trung bình": filteredResults.filter(
          (r) => getGradeClassification(r.score) === "trung bình"
        ).length,
        yếu: filteredResults.filter(
          (r) => getGradeClassification(r.score) === "yếu"
        ).length,
        kém: filteredResults.filter(
          (r) => getGradeClassification(r.score) === "kém"
        ).length,
      };

      // Tạo các tùy chọn xuất file
      const exportOptions = {
        title: `BÁO CÁO KẾT QUẢ BÀI KIỂM TRA`,
        subtitle: quizName,
        additionalInfo: {
          "Tổng số học viên": filteredResults.length.toString(),
          "Ngày xuất báo cáo": formattedDate,
          "Số học viên đạt": filteredResults
            .filter(
              (r) =>
                r.status.toLowerCase() === "đạt" ||
                r.status.toLowerCase() === "passed"
            )
            .length.toString(),
          "Điểm trung bình": (
            filteredResults.reduce((sum, r) => sum + r.score, 0) /
              filteredResults.length || 0
          ).toFixed(2),
          "Xuất sắc": gradeStats["xuất sắc"].toString(),
          Giỏi: gradeStats["giỏi"].toString(),
          Khá: gradeStats["khá"].toString(),
          "Trung bình": gradeStats["trung bình"].toString(),
          Yếu: gradeStats["yếu"].toString(),
          Kém: gradeStats["kém"].toString(),
        },
        sheetName: "Kết quả kiểm tra",
      };

      exportToExcel(dataToExport, `Kết quả ${quizName}`, exportOptions);
      showSuccessToast("Xuất file thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất file:", error);
      showErrorToast("Không thể xuất file. Vui lòng thử lại sau.");
    }
  };

  if (isLoading) {
    return (
      <div className="container px-6 max-w-7xl mx-auto py-10">
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-lg font-medium text-muted-foreground">
              Đang tải dữ liệu kết quả bài kiểm tra...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quizId) {
    return (
      <div className="container px-6 max-w-7xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">Lỗi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4">{error || "Không tìm thấy ID bài kiểm tra"}</p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6 md:mb-8 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <Tabs defaultValue="difficulty-lo-heatmap" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger
              value="difficulty-lo-heatmap"
              className="flex items-center gap-1 text-xs lg:text-sm"
            >
              <Grid3X3 className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Ma trận kiến thức</span>
              <span className="sm:hidden">MT</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-1 text-xs lg:text-sm"
            >
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Hiệu suất</span>
              <span className="sm:hidden">HS</span>
            </TabsTrigger>
            <TabsTrigger
              value="correlation"
              className="flex items-center gap-1 text-xs lg:text-sm"
            >
              <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Tương quan</span>
              <span className="sm:hidden">TQ</span>
            </TabsTrigger>
            <TabsTrigger
              value="chapter-analytics"
              className="flex items-center gap-1 text-xs lg:text-sm"
            >
              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Chuẩn đầu ra</span>
              <span className="sm:hidden">CĐR</span>
            </TabsTrigger>
            <TabsTrigger
              value="student-groups"
              className="flex items-center gap-1 text-xs lg:text-sm"
            >
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Xếp loại</span>
              <span className="sm:hidden">XL</span>
            </TabsTrigger>
            <TabsTrigger
              value="radar"
              className="flex items-center gap-1 text-xs lg:text-sm"
            >
              <Radar className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">So sánh</span>
              <span className="sm:hidden">SS</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <TimeSeriesChart quizId={quizId} className="w-full" />
            <CompletionFunnelChart quizId={quizId} className="w-full" />
            <AdvancedScoreDistributionChart
              quizId={quizId}
              className="w-full"
            />
          </TabsContent>

          <TabsContent value="correlation" className="space-y-6 mt-6">
            <TimeScoreCorrelationChart quizId={quizId} className="w-full" />
          </TabsContent>

          <TabsContent value="chapter-analytics" className="space-y-6 mt-6">
            <LearningOutcomesChart
              quizId={quizId}
              quizName={quizName}
              className="w-full"
            />
          </TabsContent>

          <TabsContent value="student-groups" className="space-y-6 mt-6">
            <StudentGroupBarChart quizId={quizId} className="w-full" />
          </TabsContent>

          <TabsContent value="radar" className="space-y-6 mt-6">
            <TeacherRadarChart
              quizId={quizId}
              quizName={quizName}
              className="w-full"
            />
          </TabsContent>

          <TabsContent value="difficulty-lo-heatmap" className="space-y-6 mt-6">
            <DifficultyLOHeatmap quizId={quizId} className="w-full" />
          </TabsContent>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl">
              Báo cáo kết quả: {quizName}
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Tổng số học viên: {results.length}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tìm kiếm theo tên học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo phân loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phân loại</SelectItem>
                <SelectItem value="xuất sắc">Xuất sắc (≥ 9.0)</SelectItem>
                <SelectItem value="giỏi">Giỏi (8.0 - 8.9)</SelectItem>
                <SelectItem value="khá">Khá (6.5 - 7.9)</SelectItem>
                <SelectItem value="trung bình">
                  Trung bình (5.0 - 6.4)
                </SelectItem>
                <SelectItem value="yếu">Yếu (3.5 - 4.9)</SelectItem>
                <SelectItem value="kém">Kém (&lt; 3.5)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExportToExcel}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Không tìm thấy kết quả phù hợp"
                  : "Chưa có học viên nào hoàn thành bài kiểm tra này"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Mã học viên</TableHead>
                    <TableHead>Tên học viên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điểm số</TableHead>
                    <TableHead>Phân loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian hoàn thành</TableHead>
                    <TableHead>Ngày cập nhật</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result, index) => (
                    <TableRow key={result.result_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{result.Student?.user_id || "N/A"}</TableCell>
                      <TableCell>{result.Student?.name || "N/A"}</TableCell>
                      <TableCell>{result.Student?.email || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${getScoreColor(
                            result.score
                          )}`}
                        >
                          {result.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                            getGradeClassification(result.score)
                          )}`}
                        >
                          {getGradeClassification(result.score).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            result.status
                          )}`}
                        >
                          {result.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {result.completion_time
                          ? `${result.completion_time} giây`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {result.update_time
                          ? formatDate(result.update_time)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hàm lấy màu cho điểm số
function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6.5) return "text-blue-600";
  if (score >= 5) return "text-yellow-600";
  return "text-red-600";
}

// Hàm lấy màu cho trạng thái
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "passed":
    case "đạt":
      return "bg-green-100 text-green-800";
    case "failed":
    case "không đạt":
      return "bg-red-100 text-red-800";
    case "completed":
    case "hoàn thành":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Hàm lấy màu cho phân loại học lực
function getGradeColor(grade: string): string {
  switch (grade.toLowerCase()) {
    case "xuất sắc":
      return "bg-purple-100 text-purple-800";
    case "giỏi":
      return "bg-green-100 text-green-800";
    case "khá":
      return "bg-blue-100 text-blue-800";
    case "trung bình":
      return "bg-yellow-100 text-yellow-800";
    case "yếu":
      return "bg-orange-100 text-orange-800";
    case "kém":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
