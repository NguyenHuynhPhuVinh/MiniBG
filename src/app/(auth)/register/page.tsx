import { Metadata } from "next";
import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata: Metadata = {
  title: "Đăng ký | Synlearnia",
  description:
    "Đăng ký tài khoản mới để sử dụng Synlearnia - Nền tảng học tập và thi trực tuyến thông minh",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10 lg:p-12">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-2">
            Đăng ký tài khoản
          </h1>
          <p className="text-muted-foreground">
            Nhập thông tin của bạn để tạo tài khoản mới
          </p>
        </div>

        {/* Sử dụng form đăng ký trực tiếp với vai trò sinh viên */}
        <RegisterForm userRole="student" />
      </div>
    </div>
  );
}
