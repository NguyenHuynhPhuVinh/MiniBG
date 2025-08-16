import * as z from "zod";

// Schema validation cho form đăng nhập
export const loginSchema = z.object({
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
});

// Schema validation cho form đăng ký
export const registerSchema = z
  .object({
    fullName: z.string().min(2, {
      message: "Họ tên phải có ít nhất 2 ký tự.",
    }),
    email: z.string().email({
      message: "Vui lòng nhập địa chỉ email hợp lệ.",
    }),
    password: z.string().min(6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Mật khẩu xác nhận phải có ít nhất 6 ký tự.",
    }),
    role: z.enum(["student", "teacher"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });
