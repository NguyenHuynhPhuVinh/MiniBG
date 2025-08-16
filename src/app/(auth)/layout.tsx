"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStatus();

  // Kiểm tra nếu người dùng đã đăng nhập, chuyển hướng đến trang dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router, isAuthenticated]);

  return <div className="min-h-screen">{children}</div>;
}
