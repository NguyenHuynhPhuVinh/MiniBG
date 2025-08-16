"use client";

import { useLayoutEffect } from "react";
import { initMocks } from "@/mocks/init";
import { MockConfig } from "@/lib/constants/mock";

interface MockInitProps {
  children: React.ReactNode;
  // Cho phép bật/tắt mock bằng code, mặc định true
  useMocks?: boolean;
}

export default function MockInit({ children, useMocks = true }: MockInitProps) {
  useLayoutEffect(() => {
    // Cấu hình code-based trước khi init, nhằm tránh race-condition với effect ở các component con
    MockConfig.setUseMocks(Boolean(useMocks));
    initMocks();
  }, [useMocks]);

  return <>{children}</>;
}
