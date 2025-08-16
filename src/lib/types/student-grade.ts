/**
 * Student Grade Data Types
 * Shared types for student grade management across components
 */

export interface StudentGradeData {
  student_id: number;
  student_name: string;
  student_email: string;
  grade_scores: Record<number, number>; // column_id -> score
  process_average: number;
  final_exam_score?: number;
  total_score: number;
  grade: string;
}

export interface StudentGradeTransformOptions {
  includeEmptyScores?: boolean;
  calculateAverages?: boolean;
  defaultGrade?: string;
}

/**
 * Transform raw student data to StudentGradeData format
 * Centralizes the transformation logic to avoid duplication
 */
export const transformStudentData = (
  students: any[],
  options: StudentGradeTransformOptions = {}
): StudentGradeData[] => {
  const {
    includeEmptyScores = true,
    calculateAverages = false,
    defaultGrade = "N/A",
  } = options;

  return students.map((student) => ({
    student_id: student.user_id,
    student_name: student.fullName || student.name || "Unknown",
    student_email: student.email || "",
    grade_scores: student.grade_scores || (includeEmptyScores ? {} : {}),
    process_average: student.process_average || 0,
    final_exam_score: student.final_exam_score,
    total_score: student.total_score || 0,
    grade: student.grade || defaultGrade,
  }));
};

/**
 * Calculate grade statistics for a group of students
 */
export const calculateGradeStatistics = (students: StudentGradeData[]) => {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      passRate: 0,
      gradeDistribution: {},
    };
  }

  const totalScore = students.reduce((sum, student) => sum + student.total_score, 0);
  const averageScore = totalScore / students.length;
  
  const passCount = students.filter(student => student.total_score >= 5).length;
  const passRate = (passCount / students.length) * 100;

  const gradeDistribution = students.reduce((dist, student) => {
    const grade = student.grade;
    dist[grade] = (dist[grade] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  return {
    totalStudents: students.length,
    averageScore: Math.round(averageScore * 100) / 100,
    passRate: Math.round(passRate * 100) / 100,
    gradeDistribution,
  };
};
