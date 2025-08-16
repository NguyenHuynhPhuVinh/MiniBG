export interface AvatarReward {
  level: number;
  avatar: string;
  avatar_name: string;
  avatar_path: string;
  description: string;
}

export interface LevelNode {
  level: number;
  tier_name: string;
  tier_color: string;
  xp_required: number;
  is_unlocked: boolean;
  is_current: boolean;
  avatar_reward?: AvatarReward;
  reward_claimed?: boolean;
}

export interface TierProgress {
  tier_name: string;
  tier_display_name: string;
  tier_color: string;
  min_level: number;
  max_level: number;
  levels: LevelNode[];
}

export interface LevelProgressData {
  current_level: number;
  current_tier: string;
  tiers: TierProgress[];
  user_avatars: string[]; // Danh sách avatar đã claim
}
