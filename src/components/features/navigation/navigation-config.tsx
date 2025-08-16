import { NavSection as NavSectionType } from "@/lib/types/nav";
import { Role } from "@/lib/auth/role-manager";

// Định nghĩa các mục navigation chung cho tất cả người dùng
export const commonNavSections: NavSectionType[] = [
  {
    items: [
      {
        title: "Tổng quan",
        href: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
];

// Định nghĩa các mục navigation cho admin
export const adminNavSections: NavSectionType[] = [
  {
    title: "QUẢN LÝ CHƯƠNG TRÌNH",
    items: [
      {
        title: "Chương trình đào tạo",
        href: "/dashboard/admin/programs",
        icon: "BookOpen",
        subItems: [
          {
            title: "Danh sách chương trình",
            href: "/dashboard/admin/programs",
          },
          {
            title: "Thêm chương trình mới",
            href: "/dashboard/admin/programs/create",
          },
        ],
      },
      {
        title: "Chuẩn đầu ra (PO)",
        href: "/dashboard/admin/pos",
        icon: "Target",
        subItems: [
          { title: "Danh sách PO", href: "/dashboard/admin/pos" },
          {
            title: "Thêm PO mới",
            href: "/dashboard/admin/pos/create",
          },
        ],
      },
      {
        title: "Chuẩn đầu ra (PLO)",
        href: "/dashboard/admin/plos",
        icon: "CheckSquare",
        subItems: [
          {
            title: "Danh sách PLO",
            href: "/dashboard/admin/plos",
          },
          {
            title: "Thêm PLO mới",
            href: "/dashboard/admin/plos/create",
          },
        ],
      },
    ],
  },
];

// Định nghĩa các mục navigation cho giáo viên
export const teacherNavSections: NavSectionType[] = [
  {
    title: "QUẢN LÝ NỘI DUNG",
    items: [
      {
        title: "Chuẩn đầu ra (LO)",
        href: "/dashboard/teaching/los",
        icon: "FileText",
        subItems: [
          { title: "Danh sách LO", href: "/dashboard/teaching/los" },
          {
            title: "Thêm LO mới",
            href: "/dashboard/teaching/los/create",
          },
        ],
      },
      {
        title: "Khóa học",
        href: "/dashboard/teaching/courses",
        icon: "GraduationCap",
        subItems: [
          { title: "Danh sách khóa học", href: "/dashboard/teaching/courses" },
          {
            title: "Thêm khóa học mới",
            href: "/dashboard/teaching/courses/create",
          },
        ],
      },
    ],
  },
  {
    title: "NGÂN HÀNG CÂU HỎI",
    items: [
      {
        title: "Câu hỏi",
        href: "/dashboard/teaching/questions",
        icon: "FileText",
        subItems: [
          {
            title: "Tất cả câu hỏi",
            href: "/dashboard/teaching/questions/list",
          },
          {
            title: "Thêm câu hỏi mới",
            href: "/dashboard/teaching/questions/new",
          },
          {
            title: "Mức độ câu hỏi",
            href: "/dashboard/teaching/levels",
          },
        ],
      },
      {
        title: "Bài kiểm tra",
        href: "/dashboard/teaching/quizzes",
        icon: "ClipboardList",
        subItems: [
          {
            title: "Danh sách bài kiểm tra",
            href: "/dashboard/teaching/quizzes/list",
          },
          {
            title: "Tạo bài kiểm tra mới",
            href: "/dashboard/teaching/quizzes/new",
          },
          {
            title: "Kết quả bài kiểm tra",
            href: "/dashboard/teaching/quiz-results",
          },
        ],
      },
    ],
  },
  {
    title: "ĐÁNH GIÁ",
    items: [
      {
        title: "Kết quả học tập",
        href: "/dashboard/teaching/course-results",
        icon: "CheckSquare",
      },
      {
        title: "Phân tích kết quả",
        href: "/dashboard/teaching/analytics",
        icon: "BarChart",
      },
    ],
  },
];

// Định nghĩa các mục navigation cho học sinh
export const studentNavSections: NavSectionType[] = [
  {
    title: "HỌC TẬP",
    items: [
      {
        title: "Hồ sơ cá nhân",
        href: "/dashboard/student/profile",
        icon: "User",
      },
      {
        title: "Khóa học của tôi",
        href: "/dashboard/student/courses",
        icon: "GraduationCap",
      },
      {
        title: "Môn học đang học",
        href: "/dashboard/student/subjects",
        icon: "BookOpen",
      },
      {
        title: "Mục tiêu học tập",
        href: "/dashboard/student/los",
        icon: "Target",
      },
      {
        title: "Bảng xếp hạng",
        href: "/dashboard/leaderboard",
        icon: "Trophy",
      },
      {
        title: "Cửa hàng",
        href: "/dashboard/shop",
        icon: "ShoppingBag",
      },
    ],
  },
  {
    title: "BÀI KIỂM TRA",
    items: [
      {
        title: "Bài kiểm tra",
        href: "/dashboard/student/quizzes",
        icon: "ClipboardList",
        subItems: [
          {
            title: "Bài kiểm tra sắp tới",
            href: "/dashboard/student/quizzes/upcoming",
          },
          {
            title: "Bài kiểm tra đã làm",
            href: "/dashboard/student/quizzes/completed",
          },
          {
            title: "Lịch sử làm bài",
            href: "/dashboard/student/quizzes/history",
          },
        ],
      },
      {
        title: "Kết quả học tập",
        href: "/dashboard/student/learning-results",
        icon: "BarChart3",
      },
    ],
  },
];

// Hàm lấy navigation dựa trên vai trò
export const getRoleBasedNavSections = (
  userRole: string | null
): NavSectionType[] => {
  if (!userRole) return commonNavSections;

  switch (userRole) {
    case Role.ADMIN:
      return [...commonNavSections, ...adminNavSections];
    case Role.TEACHER:
      return [...commonNavSections, ...teacherNavSections];
    case Role.STUDENT:
      return [...commonNavSections, ...studentNavSections];
    default:
      return commonNavSections;
  }
};
