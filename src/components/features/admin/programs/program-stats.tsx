"use client";

import React from "react";
import { BookOpen, Target, Users, GraduationCap, TrendingUp, Calendar } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";

import type { ProgramWithRelations } from "@/lib/types/program-management";

interface ProgramStatsProps {
  program: ProgramWithRelations;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${
                trend.isPositive ? '' : 'rotate-180'
              }`} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgramStats({ program, className }: ProgramStatsProps) {
  const stats = [
    {
      title: "Program Outcomes",
      value: program._count?.POs || 0,
      icon: <Target className="h-5 w-5 text-primary" />,
      description: "Chuẩn đầu ra chương trình",
    },
    {
      title: "Program Learning Outcomes", 
      value: program._count?.PLOs || 0,
      icon: <Users className="h-5 w-5 text-primary" />,
      description: "Chuẩn đầu ra học phần",
    },
    {
      title: "Môn học",
      value: program._count?.Courses || 0,
      icon: <GraduationCap className="h-5 w-5 text-primary" />,
      description: "Môn học trong chương trình",
    },
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Thống kê chương trình
          </CardTitle>
          <CardDescription>
            Tổng quan về các thành phần trong chương trình đào tạo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Program Details */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Chi tiết chương trình</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tên chương trình:</span>
                  <span className="text-sm font-medium">{program.name}</span>
                </div>
                
                {program.code && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mã chương trình:</span>
                    <Badge variant="outline">{program.code}</Badge>
                  </div>
                )}
                
                {program.duration_years && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Thời gian đào tạo:</span>
                    <span className="text-sm font-medium">{program.duration_years} năm</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ngày tạo:</span>
                  <span className="text-sm font-medium">
                    {program.created_at ? new Date(program.created_at).toLocaleDateString("vi-VN") : "Không xác định"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cập nhật cuối:</span>
                  <span className="text-sm font-medium">
                    {program.updated_at ? new Date(program.updated_at).toLocaleDateString("vi-VN") : "Không xác định"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ID:</span>
                  <Badge variant="secondary">{program.program_id}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Tiến độ phát triển</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">POs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((program._count?.POs || 0) / 10) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {program._count?.POs || 0}/10
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">PLOs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((program._count?.PLOs || 0) / 20) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {program._count?.PLOs || 0}/20
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Môn học</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((program._count?.Courses || 0) / 50) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {program._count?.Courses || 0}/50
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
