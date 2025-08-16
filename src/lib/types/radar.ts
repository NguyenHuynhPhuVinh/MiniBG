// Types cho Radar Chart Data

export interface RadarDataPoint {
  accuracy: number;
  questions_count: number;
  average_response_time: number;
  description?: string; // Thêm description cho Learning Outcomes
}

export interface PerformanceMetrics {
  average_response_time: number;
  completion_rate: number;
  first_attempt_accuracy: number;
  overall_accuracy: number;
}

export interface RadarChartData {
  difficulty_levels: Record<string, RadarDataPoint>;
  learning_outcomes: Record<string, RadarDataPoint>;
  performance_metrics: PerformanceMetrics;
}

export interface UserRadarData {
  user_id: number;
  quiz_id: number;
  radar_data: RadarChartData;
  message?: string;
  weakest_lo?: {
    lo_id?: number;
    lo_name: string;
    accuracy: number;
    chapters?: Array<{
      chapter_id: number;
      chapter_name: string;
      description?: string;
      sections: Array<{
        section_id: number;
        title: string;
        content: string;
        order: number;
      }>;
    }>;
  };
  weakest_difficulty?: {
    level: string;
    accuracy: number;
  };
}

export interface TopPerformerRadarData {
  quiz_id: number;
  top_performer: {
    user_id: number;
    name: string;
    score: number;
  };
  radar_data: RadarChartData;
}

export interface AverageRadarData {
  quiz_id: number;
  radar_data: RadarChartData;
}

export interface AllRadarData {
  quiz_id: number;
  quiz_name: string;
  total_questions: number;
  radar_data: {
    average?: RadarChartData;
    top_performer?: {
      user_info: {
        user_id: number;
        name: string;
        score: number;
      };
      data: RadarChartData;
    };
    current_user?: {
      user_id: number;
      data: RadarChartData;
    };
  };
  summary: {
    total_participants: number;
    total_answers: number;
    average_score: number;
    difficulty_levels: string[];
    learning_outcomes: Array<{
      name: string;
      description: string;
    }>;
  };
}

// Types cho Chart.js Radar Chart
export interface RadarChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointHoverBackgroundColor: string;
  pointHoverBorderColor: string;
  fill: boolean;
}

export interface RadarChartConfig {
  labels: string[];
  datasets: RadarChartDataset[];
}

// Types cho component props
export interface RadarChartProps {
  quizId: number;
  title?: string;
  showComparison?: boolean;
  height?: number;
  className?: string;
}

export interface RadarChartStudentProps {
  quizId: number;
  title?: string;
  height?: number;
  className?: string;
}
