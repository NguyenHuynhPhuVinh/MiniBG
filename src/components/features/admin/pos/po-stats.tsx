"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge, Skeleton } from "@/components/ui/feedback";
import {
  Target,
  BookOpen,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";

import { poService } from "@/lib/services/api/po.service";
import type { POWithRelations } from "@/lib/types/program-management";

interface POStatsProps {
  po: POWithRelations;
  className?: string;
}

interface POStatistics {
  total_plos: number;
  total_los: number;
  completion_rate: number;
  average_score: number;
}

export function POStats({ po, className }: POStatsProps) {
  const [stats, setStats] = useState<POStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await poService.getPOStatistics(po.po_id);
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Error loading PO statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [po.po_id]);

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng PLOs",
      value: stats?.total_plos || po._count?.PLOs || 0,
      description: "PLO liên quan",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng LOs",
      value: stats?.total_los || 0,
      description: "Learning Outcome",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: `${stats?.completion_rate || 0}%`,
      description: "Mức độ đạt được",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Điểm trung bình",
      value: stats?.average_score ? stats.average_score.toFixed(1) : "N/A",
      description: "Điểm đánh giá",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Quick stats component for smaller displays
export function POQuickStats({ po, className }: POStatsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {po._count?.PLOs || 0} PLOs
      </Badge>

      {po.Program && (
        <Badge variant="outline" className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {po.Program.name}
        </Badge>
      )}

      {po.code && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {po.code}
        </Badge>
      )}
    </div>
  );
}
