"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";

export default function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle>Quản lý Người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Quản lý tài khoản và phân quyền
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle>Hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cấu hình và giám sát hệ thống
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle>Báo cáo Tổng quan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Thống kê toàn hệ thống</p>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle>Cài đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Cấu hình hệ thống và tính năng
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
