"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { z } from "zod";

import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Card, CardContent, CardFooter } from "@/components/ui/layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { useRegisterMutation } from "@/lib/hooks/use-auth";
import { registerSchema } from "@/lib/validations/auth";

interface RegisterFormProps {
  userRole: "student" | "teacher";
}

export function RegisterForm({ userRole }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isPending, error } = useRegisterMutation();

  // Khởi tạo form với react-hook-form và zod validation
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: userRole,
    },
  });

  // Xử lý khi form được submit
  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      const result = await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
      });

      // Chỉ chuyển hướng khi đăng ký thành công (result tồn tại)
      if (result) {
        router.push("/login?registered=true");
      }
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
      // Không chuyển hướng khi có lỗi
    }
  }

  return (
    <Card className="w-full md:border-4 border-0 shadow-none bg-transparent md:bg-card">
      <CardContent className="px-4 sm:px-6 md:px-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 md:space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-4 md:space-y-8">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        Họ và tên
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nguyễn Văn A"
                          className="h-10 md:h-12 text-sm md:text-base px-3 md:px-4 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@example.com"
                          type="email"
                          className="h-10 md:h-12 text-sm md:text-base px-3 md:px-4 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4 md:space-y-8">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        Mật khẩu
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            className="h-10 md:h-12 text-sm md:text-base px-3 md:px-4 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-4 py-2 cursor-pointer hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        Xác nhận mật khẩu
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            className="h-10 md:h-12 text-sm md:text-base px-3 md:px-4 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-4 py-2 cursor-pointer hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff className="h-5 w-5" />
                          ) : (
                            <FiEye className="h-5 w-5" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword
                              ? "Ẩn mật khẩu"
                              : "Hiện mật khẩu"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* Trường role được ẩn vì đã được chọn trước đó */}
            <input type="hidden" {...form.register("role")} value={userRole} />

            {error && (
              <div className="text-destructive text-base mt-2">
                {error.message}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-10 md:h-12 text-sm md:text-base font-medium mt-4 transition-all cursor-pointer"
              disabled={isPending}
              is3DNoLayout={true}
            >
              {isPending ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <div className="text-sm md:text-base text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
