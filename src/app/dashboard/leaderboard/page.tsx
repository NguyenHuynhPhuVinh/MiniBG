"use client";

import React from "react";
import { Trophy, TrendingUp } from "lucide-react";
import Leaderboard from "@/components/features/gamification/leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Bảng Xếp Hạng
          </h1>
          <p className="text-muted-foreground">
            Xem thứ hạng của bạn và so sánh với các học viên khác
          </p>
        </div>
      </div>

      {/* Dual Leaderboards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Leaderboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Bảng Xếp Hạng Tuần
          </h2>
          <Leaderboard limit={10} showTimeframe={false} timeframe="week" />
        </div>

        {/* Monthly Leaderboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-500" />
            Bảng Xếp Hạng Tháng
          </h2>
          <Leaderboard limit={10} showTimeframe={false} timeframe="month" />
        </div>
      </div>
    </div>
  );
}
