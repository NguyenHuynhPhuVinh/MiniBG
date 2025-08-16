"use client";
import React from "react";
import { UserButton } from "./user-button";
import { Button } from "@/components/ui/forms";
import { PlusCircle, KeyRound, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useSidebarContext } from "@/lib/hooks/use-sidebar";
import { useCurrency } from "@/lib/hooks/use-currency";
import JoinQuizModal from "@/components/features/quiz/join-quiz-modal";
import {
  TeacherOnly,
  StudentOnly,
} from "@/components/features/auth/role-guard";
import { CurrencyDisplay } from "@/components/features/currency";

// Sidebar header height là h-16 (tương đương 64px)
export const TopNavBar: React.FC<TopNavBarProps> = ({ className = "" }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStatus();
  const { isMobile, toggleMobileSidebar, isSidebarVisible } =
    useSidebarContext();
  const { balance, loading, error, refresh } = useCurrency();

  const handleCreateQuiz = () => {
    router.push("/dashboard/teaching/quizzes/new");
  };

  const handleToggleMenu = () => {
    console.log("Toggle menu clicked. Current state:", isSidebarVisible);
    toggleMobileSidebar();
  };

  return (
    <header
      className={`w-full h-16 min-h-16 max-h-16 bg-background px-6 flex items-center border-b border-border/60 transition-colors duration-200 ${className}`}
      style={{ boxShadow: "none" }}
    >
      {/* Left section - Menu button for mobile */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMenu}
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Center section - Quiz actions */}
      <div className="flex-1 flex items-center justify-center">
        {isAuthenticated() && (
          <>
            <TeacherOnly>
              <Button
                onClick={handleCreateQuiz}
                variant="default"
                size="lg"
                is3DNoLayout={true}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo Quiz</span>
              </Button>
            </TeacherOnly>
            <StudentOnly>
              <JoinQuizModal
                trigger={
                  <Button
                    variant="default"
                    size="lg"
                    is3DNoLayout={true}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Nhập PIN</span>
                  </Button>
                }
              />
            </StudentOnly>
          </>
        )}
      </div>

      {/* Currency section - Between center and right - Student Only */}
      {isAuthenticated() && (
        <StudentOnly>
          <div className="flex items-center justify-end flex-1 max-w-xs mr-4">
            <CurrencyDisplay
              balance={balance || null}
              loading={loading}
              error={error}
              onRetry={refresh}
              config={{
                compact: isMobile,
                showTooltip: !isMobile,
                showIcons: true,
              }}
              className="transition-all duration-200"
            />
          </div>
        </StudentOnly>
      )}

      {/* Right section - User button */}
      <div className="flex items-center gap-3 flex-shrink-0 min-w-0 max-w-fit">
        <UserButton />
      </div>
    </header>
  );
};

interface TopNavBarProps {
  className?: string;
}
