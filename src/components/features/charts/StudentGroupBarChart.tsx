"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import { Button } from "@/components/ui/forms";
import {
  Loader2,
  Users,
  CheckCircle,
  BarChart3,
  Eye,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { showErrorToast } from "@/lib/utils/toast-utils";
import QuestionsList from "./QuestionsList";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StudentGroupBarChartProps {
  quizId: number;
  className?: string;
}

// API Response Types based on spec
interface ChartData {
  group_name: string;
  display_name: string;
  student_count: number;
  percentage: number;
  score_range: { min: number; max: number; average: number };
  color: string;
}

interface StudentGroupsChartResponse {
  chart_data: ChartData[];
  total_students: number;
  chart_config: {
    x_axis: string;
    y_axis: string;
    tooltip_fields: string[];
    clickable: boolean;
  };
}

interface StudentDetail {
  user_id: number;
  name: string;
  email: string;
  score: number;
  percentage_score: number;
  completion_time: number;
  average_time_per_question: number;
  total_questions_attempted: number;
  correct_answers: number;
}

interface GroupDetailResponse {
  group_info: {
    group_name: string;
    display_name: string;
    student_count: number;
    average_score: number;
    average_percentage: number;
    threshold: number;
  };
  students: StudentDetail[];
  insights: string[];
  recommendations: Array<{
    type: string;
    suggestion: string;
    priority: string;
  }>;
}

export default function StudentGroupBarChart({
  quizId,
  className = "",
}: StudentGroupBarChartProps) {
  const [chartData, setChartData] = useState<StudentGroupsChartResponse | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupDetailData, setGroupDetailData] =
    useState<GroupDetailResponse | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(
    null
  );
  const [studentLOData, setStudentLOData] = useState<any>(null);
  const [selectedLO, setSelectedLO] = useState<any>(null);
  const [loQuestionsData, setLoQuestionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(false);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [loQuestionsLoading, setLoQuestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch chart data for bar chart
  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await chapterAnalyticsService.getStudentGroupsChart(
        quizId
      );

      console.log("Chart data for bar chart:", result);
      setChartData(result);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(errorMessage);
      showErrorToast("Không thể tải dữ liệu biểu đồ");
    } finally {
      setLoading(false);
    }
  };

  // Fetch group detail data when clicking on a bar
  const fetchGroupDetail = async (groupName: string) => {
    try {
      setGroupLoading(true);
      const result = await chapterAnalyticsService.getStudentGroupAnalysis(
        quizId,
        groupName
      );

      console.log("Group detail data:", result);
      setGroupDetailData(result);
    } catch (err) {
      console.error("Error fetching group detail:", err);
      showErrorToast("Không thể tải chi tiết nhóm");
    } finally {
      setGroupLoading(false);
    }
  };

  // Fetch student LO analysis when clicking "Xem chi tiết"
  const fetchStudentDetail = async (student: StudentDetail) => {
    try {
      setStudentDetailLoading(true);
      const result = await chapterAnalyticsService.getStudentLOAnalysis(
        quizId,
        student.user_id
      );

      console.log("Student LO analysis data:", result);
      setStudentLOData(result);
      setSelectedStudent(student);
    } catch (err) {
      console.error("Error fetching student detail:", err);
      showErrorToast("Không thể tải chi tiết Chuẩn đầu ra của sinh viên");
    } finally {
      setStudentDetailLoading(false);
    }
  };

  // Fetch questions by LO when clicking on LO
  const fetchLOQuestions = async (lo: any) => {
    try {
      setLoQuestionsLoading(true);
      const result = await chapterAnalyticsService.getQuestionsByLO(
        quizId,
        lo.lo_id,
        selectedStudent?.user_id
      );

      console.log("LO questions data:", result);
      setLoQuestionsData(result);
      setSelectedLO(lo);
    } catch (err) {
      console.error("Error fetching LO questions:", err);
      showErrorToast("Không thể tải danh sách câu hỏi của Learning Outcome");
    } finally {
      setLoQuestionsLoading(false);
    }
  };

  // Handle back to LO list
  const handleBackToLOList = () => {
    setSelectedLO(null);
    setLoQuestionsData(null);
  };

  useEffect(() => {
    if (quizId) {
      fetchChartData();
    }
  }, [quizId]);

  // Handle bar click
  const handleBarClick = (groupName: string) => {
    setSelectedGroup(groupName);
    setSelectedStudent(null); // Reset selected student
    setStudentLOData(null); // Reset LO data
    fetchGroupDetail(groupName);
  };

  // Handle student detail click - show chart view
  const handleStudentDetailClick = (student: StudentDetail) => {
    fetchStudentDetail(student);
  };

  // Handle back to table
  const handleBackToTable = () => {
    setSelectedStudent(null);
    setStudentLOData(null);
    setSelectedLO(null);
    setLoQuestionsData(null);
  };

  // Helper functions
  const getGroupColor = (groupName: string) => {
    switch (groupName) {
      case "excellent":
        return "#10B981"; // Green for Xuất sắc (≥80%)
      case "good":
        return "#3B82F6"; // Blue for Giỏi (70-79%)
      case "average":
        return "#F59E0B"; // Orange for Khá (60-69%)
      case "medium":
        return "#FCD34D"; // Yellow for Trung bình (40-59%)
      case "weak":
        return "#EF4444"; // Red for Yếu (<40%)
      default:
        return "#9E9E9E";
    }
  };

  const getGroupLabel = (groupName: string) => {
    // Ưu tiên sử dụng display_name từ API nếu có (đồng bộ tuyệt đối với backend)
    const matchedGroup = groups.find((g) => g.group_name === groupName);
    if (matchedGroup?.display_name) return matchedGroup.display_name;

    // Fallback mapping phòng trường hợp không có dữ liệu groups
    switch (groupName) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Giỏi";
      case "average":
        return "Khá";
      case "medium":
        return "Trung bình";
      case "weak":
        return "Yếu";
      default:
        return groupName;
    }
  };

  // Extract MSSV from email
  const getMSSVFromEmail = (email: string): string => {
    if (!email) return "N/A";
    // Extract part before @ symbol
    const mssv = email.split("@")[0];
    return mssv || "N/A";
  };

  // Get chart data from API response
  const groups = chartData?.chart_data || [];

  // Prepare Chart.js data
  const chartJSData = {
    labels: groups.map((group) => group.display_name),
    datasets: [
      {
        label: "Số lượng học sinh",
        data: groups.map((group) => group.student_count || 0),
        backgroundColor: groups.map((group) => getGroupColor(group.group_name)),
        borderColor: groups.map((group) => getGroupColor(group.group_name)),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Chart.js options with click handler
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since we have our own
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const group = groups[context.dataIndex];
            return [
              `Tỷ lệ: ${(group.percentage || 0).toFixed(1)}%`,
              `Điểm TB: ${group.score_range?.average?.toFixed(1) || "N/A"}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Số lượng học sinh",
        },
      },
      x: {
        title: {
          display: true,
          text: "Nhóm học sinh",
        },
      },
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        const clickedGroup = groups[clickedIndex];
        if (clickedGroup) {
          handleBarClick(clickedGroup.group_name);
        }
      }
    },
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3 mx-auto" />
            <p className="text-muted-foreground">Đang tải dữ liệu biểu đồ...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-8">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-600 mb-2">
            Lỗi tải dữ liệu
          </p>
          <p className="text-muted-foreground text-center mb-4">{error}</p>
          <Button onClick={fetchChartData} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Phân bố nhóm học sinh
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click vào cột để xem chi tiết nhóm
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart.js Bar Chart */}
            <div className="h-64">
              <Bar data={chartJSData} options={chartOptions} />
            </div>

            {/* Legend with Selection Indicator */}
            <div className="flex flex-wrap justify-center gap-4 pt-4 border-t">
              {groups.map((group) => (
                <div
                  key={group.group_name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    selectedGroup === group.group_name
                      ? "bg-primary/10 ring-2 ring-primary/20"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleBarClick(group.group_name)}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getGroupColor(group.group_name) }}
                  />
                  <span
                    className={`text-sm ${
                      selectedGroup === group.group_name
                        ? "font-medium text-primary"
                        : ""
                    }`}
                  >
                    {group.display_name}
                  </span>
                  {selectedGroup === group.group_name && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Group Details */}
      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Danh sách sinh viên nhóm {getGroupLabel(selectedGroup)}
              {groupLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Danh sách chi tiết các sinh viên trong nhóm xếp loại
            </p>
          </CardHeader>
          <CardContent>
            {/* Show student detail chart if selected */}
            {selectedStudent && studentLOData ? (
              <div className="space-y-4">
                {/* Back button */}
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToTable}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại danh sách
                  </Button>
                </div>

                {/* Student info header */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    Chi tiết Chuẩn đầu ra - {selectedStudent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    MSSV: {getMSSVFromEmail(selectedStudent.email || "")}
                  </p>
                </div>

                {/* Student Performance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white border rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedStudent.score?.toFixed(1) || "0.0"}
                    </div>
                    <div className="text-sm text-muted-foreground">Điểm số</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedStudent.percentage_score?.toFixed(1) || "0.0"}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Độ chính xác
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedStudent.correct_answers || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Câu đúng
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedStudent.total_questions_attempted || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tổng câu
                    </div>
                  </div>
                </div>

                {/* Chuẩn đầu ra Charts */}
                {studentLOData.lo_analysis &&
                  studentLOData.lo_analysis.length > 0 && (
                    <div className="space-y-6">
                      <h4 className="font-semibold mb-4 text-lg">
                        Biểu đồ Chuẩn đầu ra
                      </h4>

                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart - Achievement Percentage (click a bar to view questions) */}
                        <div className="bg-white border rounded-lg p-4">
                          <h5 className="font-medium mb-4 text-center">
                            Phần trăm đạt được theo Chuẩn đầu ra
                          </h5>
                          <div className="h-64">
                            <Bar
                              data={{
                                labels: studentLOData.lo_analysis.map(
                                  (lo: any) =>
                                    lo.lo_name.length > 15
                                      ? lo.lo_name.substring(0, 15) + "..."
                                      : lo.lo_name
                                ),
                                datasets: [
                                  {
                                    label: "Phần trăm đạt được (%)",
                                    data: studentLOData.lo_analysis.map(
                                      (lo: any) =>
                                        lo.achievement_percentage || 0
                                    ),
                                    backgroundColor:
                                      studentLOData.lo_analysis.map(
                                        (lo: any) => {
                                          const percentage =
                                            lo.achievement_percentage || 0;
                                          if (percentage >= 80)
                                            return "#10B981"; // green - Xuất sắc
                                          if (percentage >= 70)
                                            return "#3B82F6"; // blue - Giỏi
                                          if (percentage >= 60)
                                            return "#F59E0B"; // orange - Khá
                                          if (percentage >= 40)
                                            return "#FCD34D"; // yellow - Trung bình
                                          return "#EF4444"; // red - Yếu
                                        }
                                      ),
                                    borderColor: studentLOData.lo_analysis.map(
                                      (lo: any) => {
                                        const percentage =
                                          lo.achievement_percentage || 0;
                                        if (percentage >= 80) return "#059669"; // green border
                                        if (percentage >= 70) return "#2563EB"; // blue border
                                        if (percentage >= 60) return "#D97706"; // orange border
                                        if (percentage >= 40) return "#F59E0B"; // yellow border
                                        return "#DC2626"; // red border
                                      }
                                    ),
                                    borderWidth: 1,
                                    borderRadius: 4,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    display: false,
                                  },
                                  tooltip: {
                                    callbacks: {
                                      title: function (context: any) {
                                        const index = context[0].dataIndex;
                                        return studentLOData.lo_analysis[index]
                                          .lo_name;
                                      },
                                      label: function (context: any) {
                                        const index = context.dataIndex;
                                        const lo =
                                          studentLOData.lo_analysis[index];
                                        const percentage =
                                          lo.achievement_percentage || 0;

                                        // Determine classification based on percentage
                                        let classification = "";
                                        if (percentage >= 80) {
                                          classification = "Xuất sắc";
                                        } else if (percentage >= 70) {
                                          classification = "Giỏi";
                                        } else if (percentage >= 60) {
                                          classification = "Khá";
                                        } else if (percentage >= 40) {
                                          classification = "Trung bình";
                                        } else {
                                          classification = "Yếu";
                                        }

                                        return [
                                          `Đạt được: ${context.parsed.y.toFixed(
                                            1
                                          )}%`,
                                          `Phân loại: ${classification}`,
                                          `Câu đúng: ${lo.correct_answers}/${lo.total_questions}`,
                                        ];
                                      },
                                    },
                                  },
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    max: 100,
                                    ticks: {
                                      callback: function (value: any) {
                                        return value + "%";
                                      },
                                    },
                                    title: {
                                      display: true,
                                      text: "Phần trăm (%)",
                                    },
                                  },
                                  x: {
                                    title: {
                                      display: true,
                                      text: "Chuẩn đầu ra",
                                    },
                                  },
                                },
                                onClick: (_event: any, elements: any) => {
                                  if (elements && elements.length > 0) {
                                    const clickedIndex = elements[0].index;
                                    const lo =
                                      studentLOData.lo_analysis[clickedIndex];
                                    if (lo) {
                                      fetchLOQuestions(lo);
                                    }
                                  }
                                },
                              }}
                            />
                          </div>
                        </div>

                        {/* Doughnut Chart - Performance Distribution */}
                        <div className="bg-white border rounded-lg p-4">
                          <h5 className="font-medium mb-4 text-center">
                            Phân bố mức độ thành tích
                          </h5>
                          <div className="h-64">
                            <Doughnut
                              data={{
                                labels: [
                                  "Xuất sắc (≥80%)",
                                  "Giỏi (70-79%)",
                                  "Khá (60-69%)",
                                  "Trung bình (40-59%)",
                                  "Yếu (<40%)",
                                ],
                                datasets: [
                                  {
                                    data: [
                                      studentLOData.lo_analysis.filter(
                                        (lo: any) =>
                                          (lo.achievement_percentage || 0) >= 80
                                      ).length,
                                      studentLOData.lo_analysis.filter(
                                        (lo: any) =>
                                          (lo.achievement_percentage || 0) >=
                                            70 &&
                                          (lo.achievement_percentage || 0) < 80
                                      ).length,
                                      studentLOData.lo_analysis.filter(
                                        (lo: any) =>
                                          (lo.achievement_percentage || 0) >=
                                            60 &&
                                          (lo.achievement_percentage || 0) < 70
                                      ).length,
                                      studentLOData.lo_analysis.filter(
                                        (lo: any) =>
                                          (lo.achievement_percentage || 0) >=
                                            40 &&
                                          (lo.achievement_percentage || 0) < 60
                                      ).length,
                                      studentLOData.lo_analysis.filter(
                                        (lo: any) =>
                                          (lo.achievement_percentage || 0) < 40
                                      ).length,
                                    ],
                                    backgroundColor: [
                                      "#10B981", // Green - Xuất sắc
                                      "#3B82F6", // Blue - Giỏi
                                      "#F59E0B", // Orange - Khá
                                      "#FCD34D", // Yellow - Trung bình
                                      "#EF4444", // Red - Yếu
                                    ],
                                    borderColor: [
                                      "#059669", // Green border
                                      "#2563EB", // Blue border
                                      "#D97706", // Orange border
                                      "#F59E0B", // Yellow border
                                      "#DC2626", // Red border
                                    ],
                                    borderWidth: 2,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: "right" as const,
                                    labels: {
                                      padding: 20,
                                      usePointStyle: true,
                                    },
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context: any) {
                                        const total =
                                          context.dataset.data.reduce(
                                            (a: number, b: number) => a + b,
                                            0
                                          );
                                        const percentage =
                                          total > 0
                                            ? (
                                                (context.parsed / total) *
                                                100
                                              ).toFixed(1)
                                            : "0.0";
                                        return `${context.label}: ${context.parsed} LO (${percentage}%)`;
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Questions View (shown after clicking a bar) */}
                      <div className="bg-white border rounded-lg p-4">
                        {loQuestionsLoading && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Đang tải câu hỏi...
                            </span>
                          </div>
                        )}
                        {selectedLO &&
                          loQuestionsData &&
                          !loQuestionsLoading && (
                            <QuestionsList
                              questions={loQuestionsData}
                              title="Danh sách câu hỏi"
                            />
                          )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              /* Show table when no student selected */
              <>
                {groupLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3 mx-auto" />
                      <p className="text-muted-foreground">
                        Đang tải danh sách học sinh...
                      </p>
                    </div>
                  </div>
                ) : groupDetailData?.students &&
                  groupDetailData.students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">STT</TableHead>
                          <TableHead className="w-24">MSSV</TableHead>
                          <TableHead className="w-48">Họ và tên</TableHead>
                          <TableHead className="w-20">Điểm</TableHead>
                          <TableHead className="w-32">Số câu đạt</TableHead>
                          <TableHead className="w-32">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(groupDetailData.students) &&
                          groupDetailData.students.map(
                            (student: any, index: number) => (
                              <TableRow key={student.user_id}>
                                <TableCell className="font-medium">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {getMSSVFromEmail(student?.email || "")}
                                </TableCell>
                                <TableCell
                                  className="font-medium max-w-48 truncate"
                                  title={student?.name || "Không có tên"}
                                >
                                  {student?.name || "Không có tên"}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`font-bold ${
                                      student?.score >= 8
                                        ? "text-green-600"
                                        : student?.score >= 6.5
                                        ? "text-blue-600"
                                        : student?.score >= 5
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {student?.score?.toFixed(1) || "0.0"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="text-center">
                                    <span className="font-medium text-green-600">
                                      {student?.correct_answers || 0}
                                    </span>
                                    <span className="text-muted-foreground mx-1">
                                      /
                                    </span>
                                    <span className="text-muted-foreground">
                                      {student?.total_questions_attempted || 0}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                      handleStudentDetailClick(student)
                                    }
                                    disabled={studentDetailLoading}
                                  >
                                    {studentDetailLoading ? (
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                      <Eye className="h-3 w-3 mr-1" />
                                    )}
                                    Xem chi tiết
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      {groupDetailData?.students
                        ? "Không có sinh viên trong nhóm này"
                        : "Không có dữ liệu sinh viên"}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
