"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Trophy, Star, Zap, RefreshCw } from "lucide-react";
import { useGamification } from "@/lib/hooks/use-gamification";
import { gamificationService } from "@/lib/services/api";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  limit?: number;
  showTimeframe?: boolean;
  timeframe?: string;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  limit = 10,
  showTimeframe = true,
  timeframe: initialTimeframe = "all",
  className,
}) => {
  const { leaderboard, isLeaderboardLoading, fetchLeaderboard } =
    useGamification();
  const [timeframe, setTimeframe] = useState(initialTimeframe);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    fetchLeaderboard(limit, value);
  };

  const handleRefresh = () => {
    fetchLeaderboard(limit, timeframe);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return position;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700";
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Trophy className="w-4 h-4" />;
    if (level >= 5) return <Star className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <Card
      className={cn(
        "w-full border-2 hover:border-primary transition-all",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Bảng Xếp Hạng
        </CardTitle>
        <div className="flex items-center gap-2">
          {showTimeframe && (
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLeaderboardLoading}
          >
            <RefreshCw
              className={cn("w-4 h-4", isLeaderboardLoading && "animate-spin")}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLeaderboardLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có dữ liệu xếp hạng</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                  entry.position <= 3
                    ? "border-primary/20 bg-primary/5"
                    : "hover:bg-muted/50 hover:border-primary/50"
                )}
              >
                {/* Rank */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg border-2",
                    getRankColor(entry.position)
                  )}
                >
                  {getRankIcon(entry.position)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {entry.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-0.5"
                      style={{
                        backgroundColor: `${gamificationService.getLevelColor(
                          entry.current_level
                        )}20`,
                        color: gamificationService.getLevelColor(
                          entry.current_level
                        ),
                      }}
                    >
                      {getLevelIcon(entry.current_level)}
                      <span className="text-xs">Lv.{entry.current_level}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>
                      Độ chính xác:{" "}
                      {gamificationService.calculateAccuracyRate(
                        entry.stats.total_correct_answers,
                        entry.stats.total_questions_answered
                      )}
                      %
                    </span>
                    <span>Streak: {entry.stats.best_streak}</span>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p
                    className="font-bold text-lg"
                    style={{
                      color: gamificationService.getLevelColor(
                        entry.current_level
                      ),
                    }}
                  >
                    {gamificationService.formatPoints(entry.total_points)}
                  </p>
                  <p className="text-xs text-muted-foreground">điểm</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show more button */}
        {leaderboard.length >= limit && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => fetchLeaderboard(limit + 10, timeframe)}
              disabled={isLeaderboardLoading}
            >
              Xem thêm
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
