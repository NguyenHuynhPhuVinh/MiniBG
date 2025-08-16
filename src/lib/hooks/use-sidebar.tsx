"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import { usePathname } from "next/navigation";

interface UseSidebarOptions {
  defaultCollapsed?: boolean;
}

// Định nghĩa kiểu trạng thái của sidebar
interface SidebarState {
  collapsed: boolean;
  showToggle: boolean;
  isTextVisible: boolean;
  isMobile: boolean;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  closeMobileSidebar: () => void;
}

// Tạo context với giá trị mặc định
const SidebarContext = createContext<SidebarState | null>(null);

// Hook cung cấp context cho các component con
export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebarContext phải được sử dụng trong SidebarProvider"
    );
  }
  return context;
}

// Provider component
export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const sidebarState = useSidebar({ defaultCollapsed });

  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar({
  defaultCollapsed = false,
}: UseSidebarOptions = {}): SidebarState {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showToggle, setShowToggle] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(!defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathRef = useRef(pathname);

  // Kiểm tra kích thước màn hình khi component được mount
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 768;
      const isLaptopView = window.innerWidth < 1280;

      // Cập nhật trạng thái mobile trước
      setIsMobile(isMobileView);

      // Xử lý logic khác nhau cho mobile và desktop
      if (isMobileView) {
        // Trên mobile, sidebar mặc định ẩn
        // và luôn ở dạng mở rộng khi hiển thị
        setCollapsed(false);
      } else {
        // Trên desktop, sidebar luôn hiển thị
        setIsSidebarVisible(true);

        // Thu gọn sidebar tự động trên laptop
        if (isLaptopView) {
          setCollapsed(true);
        }
      }
    };

    // Chạy kiểm tra khi component được mount
    checkScreenSize();

    // Thêm event listener để kiểm tra khi resize cửa sổ
    window.addEventListener("resize", checkScreenSize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Theo dõi thay đổi pathname để đóng sidebar khi chuyển trang trên mobile
  useEffect(() => {
    if (pathname !== previousPathRef.current && isMobile && isSidebarVisible) {
      console.log("Đường dẫn thay đổi, đóng sidebar trên mobile:", pathname);
      setIsSidebarVisible(false);
    }
    previousPathRef.current = pathname;
  }, [pathname, isMobile, isSidebarVisible]);

  // Xử lý hiệu ứng hiển thị text khi sidebar thay đổi trạng thái
  useEffect(() => {
    if (!collapsed) {
      // Đợi animation hoàn thành mới hiện text (300ms)
      timeoutRef.current = setTimeout(() => setIsTextVisible(true), 300);
    } else {
      // Ẩn text ngay khi đóng sidebar
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsTextVisible(false);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [collapsed]);

  // Functions để thay đổi trạng thái sidebar
  const toggleSidebar = () => setCollapsed(!collapsed);
  const handleMouseEnter = () => setShowToggle(true);
  const handleMouseLeave = () => setShowToggle(false);

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsSidebarVisible(false);
    }
  };

  const toggleMobileSidebar = () => {
    console.log(
      "Toggling mobile sidebar from",
      isSidebarVisible,
      "to",
      !isSidebarVisible
    );
    setIsSidebarVisible((prev) => !prev);
  };

  return {
    collapsed,
    showToggle,
    isTextVisible,
    isMobile,
    isSidebarVisible,
    toggleSidebar,
    toggleMobileSidebar,
    handleMouseEnter,
    handleMouseLeave,
    closeMobileSidebar,
  };
}
