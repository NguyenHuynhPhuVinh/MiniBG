"use client";

import React from "react";
import {
  StudentOnly,
  TeacherOnly,
  AdminOnly,
} from "@/components/features/auth/role-guard";
import {
  StudentDashboard,
  TeacherDashboard,
  AdminDashboard,
} from "@/components/features/dashboard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Chào mừng bạn quay trở lại!</p>
        </div>
      </div>

      {/* Student Dashboard */}
      <StudentOnly>
        <StudentDashboard />
      </StudentOnly>

      {/* Teacher Dashboard */}
      <TeacherOnly>
        <TeacherDashboard />
      </TeacherOnly>

      {/* Admin Dashboard */}
      <AdminOnly>
        <AdminDashboard />
      </AdminOnly>
    </div>
  );
}
