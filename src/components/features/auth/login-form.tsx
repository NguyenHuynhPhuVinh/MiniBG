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
import { useLoginMutation } from "@/lib/hooks/use-auth";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isPending, error } = useLoginMutation();

  // Khởi tạo form với react-hook-form và zod validation
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Xử lý khi form được submit
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const result = await login(values);
      // Chỉ chuyển hướng khi đăng nhập thành công (result tồn tại)
      if (result) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@example.com"
                      type="email"
                      className="h-10 md:h-12 text-base px-3 md:px-4 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-base font-medium">
                      Mật khẩu
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="h-10 md:h-12 text-base px-3 md:px-4 transition-all"
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
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <div className="text-sm md:text-base text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
