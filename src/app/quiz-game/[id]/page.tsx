"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import để tránh SSR issues với Phaser
const QuizGameWrapper = dynamic(
  () => import("@/components/features/game/QuizGameWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-sky-300 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-white" />
          <p className="text-white text-lg">Đang tải quiz game...</p>
        </div>
      </div>
    ),
  }
);

const QuizGamePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const quizId = parseInt(id as string, 10);
  const { user, loading: authLoading } = useAuthStatus();

  // Kiểm tra authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Kiểm tra quiz ID hợp lệ
  useEffect(() => {
    if (isNaN(quizId)) {
      router.push("/dashboard");
    }
  }, [quizId, router]);

  // Hiển thị loading khi đang kiểm tra auth
  if (authLoading || !user) {
    return (
      <div className="w-full h-screen bg-sky-300 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-white" />
          <p className="text-white text-lg">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <QuizGameWrapper quizId={quizId} user={user} />
    </div>
  );
};

export default QuizGamePage;
