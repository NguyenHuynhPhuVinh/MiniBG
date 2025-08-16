"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStatus } from "./use-auth";

/**
 * Hook bảo vệ route yêu cầu xác thực
 * @returns Trạng thái kiểm tra xác thực
 */
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStatus();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Thực hiện kiểm tra xác thực ngay lập tức
    const checkAuth = () => {
      // Danh sách các route không cần xác thực
      const publicRoutes = ["/login", "/register"];
      
      // Kiểm tra xem route hiện tại có cần xác thực không
      const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
      
      // Nếu không phải route công khai và chưa xác thực, chuyển hướng về trang đăng nhập
      if (!isPublicRoute && !isAuthenticated()) {
        // Chuyển hướng ngay lập tức
        router.replace("/login");
        setIsAuthorized(false);
      } 
      // Nếu đã xác thực và đang ở trang đăng nhập/đăng ký, chuyển hướng về dashboard
      else if (isAuthenticated() && isPublicRoute) {
        router.replace("/dashboard");
        setIsAuthorized(true);
      }
      // Nếu đã xác thực và đang ở trang cần xác thực, cho phép truy cập
      else if (isAuthenticated() && !isPublicRoute) {
        setIsAuthorized(true);
      }
      
      setIsChecking(false);
    };

    // Chạy kiểm tra ngay lập tức
    checkAuth();
  }, [pathname, router, isAuthenticated]);

  return { isChecking, isAuthorized };
}
