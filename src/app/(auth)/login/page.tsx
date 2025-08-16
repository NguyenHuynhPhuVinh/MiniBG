import { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | Synlearnia",
  description:
    "Đăng nhập vào Synlearnia - Nền tảng học tập và thi trực tuyến thông minh",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10 lg:p-12">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-2">
            Đăng nhập
          </h1>
          <p className="text-muted-foreground">
            Nhập thông tin đăng nhập của bạn để tiếp tục
          </p>
        </div>

        {/* Form đăng nhập */}
        <LoginForm />
      </div>
    </div>
  );
}
