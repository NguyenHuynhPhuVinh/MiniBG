// Gamification system TypeScript interfaces

// Tier Information Interface
export interface TierInfo {
  tier_name: string;
  tier_color: string;
  min_level: number;
  max_level: number;
  min_xp: number;
  max_xp: number;
}

// User Level Progress Interface - Complete gamification info structure
export interface UserLevelProgress {
  user_id: number;
  name: string;
  total_points: number;
  current_level: number;
  experience_points: number; // XP trong level hiện tại
  experience_to_next_level: number;
  tier_info: {
    tier_name: string;
    tier_color: string;
    level_in_tier: number;
    xp_in_tier: number;
    xp_required_for_tier: number;
  };
  next_level_info: {
    level: number;
    tier_name: string;
    tier_color: string;
    xp_required: number;
  } | null;
  stats: {
    total_quizzes_completed: number;
    total_correct_answers: number;
    total_questions_answered: number;
    average_response_time: number;
    best_streak: number;
    current_streak: number;
    speed_bonus_earned: number;
    perfect_scores: number;
  };
}

// Badge Rarity Type (deprecated with badges/titles removal)
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

// API Response Interfaces
export interface UserLevelProgressResponse {
  success: boolean;
  data: UserLevelProgress;
}

export interface TierInfoResponse {
  success: boolean;
  data: {
    tiers: TierInfo[];
    total_tiers: number;
  };
}

// Updated UserGamificationInfo interface to include tier information
export interface UserGamificationInfo {
  user_id: number;
  name: string;
  total_points: number;
  current_level: number;
  experience_points: number;
  experience_to_next_level: number;
  tier_info?: {
    tier_name: string;
    tier_color: string;
  };
  next_level_info?: {
    level: number;
    tier_name: string;
    tier_color: string;
    xp_required: number;
  } | null;
  active_title?: {
    title_id: number;
    title_name: string;
    title_display: string;
    tier_name: string;
    color: string;
  } | null;
  stats: {
    total_quizzes_completed: number;
    total_correct_answers: number;
    total_questions_answered: number;
    best_streak: number;
    current_streak: number;
    speed_bonus_earned: number;
    perfect_scores: number;
    average_response_time: number;
  };
}

// Existing interfaces for backward compatibility
export interface LeaderboardEntry {
  position: number;
  user_id: number;
  name: string;
  total_points: number;
  current_level: number;
  stats: UserGamificationInfo["stats"];
}

export interface GamificationStats {
  overview: {
    total_users: number;
    active_users: number;
    engagement_rate: string;
  };
  top_performers: LeaderboardEntry[];
  level_distribution: Array<{
    current_level: number;
    count: number;
  }>;
}

export interface AddPointsRequest {
  user_id: number;
  points: number;
  reason?: string;
}
