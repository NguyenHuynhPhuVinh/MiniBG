"use client";

import { Sidebar } from "@/components/features/navigation";
import { TopNavBar } from "@/components/features/navigation/top-navbar/top-navbar";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AuthLoading } from "@/components/features/shared/loading";
import { SidebarProvider } from "@/lib/hooks/use-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sử dụng hook bảo vệ route
  const { isChecking, isAuthorized } = useAuthGuard();

  // Nếu đang kiểm tra xác thực hoặc không được phép truy cập, hiển thị màn hình loading
  // Màn hình này sẽ hiển thị trong khi đang chuyển hướng
  if (isChecking || !isAuthorized) {
    return <AuthLoading />;
  }

  // Chỉ hiển thị nội dung dashboard khi đã xác thực thành công
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <TopNavBar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
