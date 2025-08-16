"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Trophy,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  Award,
} from "lucide-react";
import UserLevelBadge from "@/components/features/gamification/user-level-badge";
import LevelProgressTracker from "@/components/features/gamification/level-progress-tracker";
import { useGamification } from "@/lib/hooks/use-gamification";
import { gamificationService } from "@/lib/services";

export default function StudentDashboard() {
  const { userGamification, isLoading } = useGamification();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!userGamification) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có dữ liệu</h3>
          <p className="text-muted-foreground text-center">
            Hãy tham gia quiz để bắt đầu hành trình học tập của bạn!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Badge */}
      <UserLevelBadge variant="detailed" />

      {/* Level Progress Tracker with avatar rewards */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Phần thưởng theo cấp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LevelProgressTracker />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-primary transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Điểm</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gamificationService.formatPoints(userGamification?.total_points)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cấp độ {userGamification?.current_level || 1}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ Chính Xác</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gamificationService.calculateAccuracyRate(
                userGamification?.stats?.total_correct_answers,
                userGamification?.stats?.total_questions_answered
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {userGamification?.stats?.total_correct_answers || 0}/
              {userGamification?.stats?.total_questions_answered || 0} câu đúng
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Streak Tốt Nhất
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGamification?.stats?.best_streak || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Hiện tại: {userGamification?.stats?.current_streak || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quiz Hoàn Thành
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGamification?.stats?.total_quizzes_completed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {userGamification?.stats?.perfect_scores || 0} điểm tuyệt đối
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
