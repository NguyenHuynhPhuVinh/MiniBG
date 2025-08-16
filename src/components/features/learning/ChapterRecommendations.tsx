"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/layout";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Chapter, ChapterSection } from "@/lib/types/quiz";

interface ChapterRecommendationsProps {
  weakestLO?: {
    lo_id?: number;
    lo_name: string;
    accuracy: number;
    chapters?: Array<{
      chapter_id: number;
      chapter_name: string;
      description?: string;
      sections: Array<{
        section_id: number;
        title: string;
        content: string;
        order: number;
      }>;
    }>;
  };
  className?: string;
}

interface ChapterCardProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
}

function ChapterCard({ chapter, isExpanded, onToggle }: ChapterCardProps) {
  return (
    <Card className="border-l-4 border-l-blue-500 cursor-pointer">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">
                    {chapter.chapter_name}
                  </CardTitle>
                  {chapter.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {chapter.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {chapter.sections.length} phần
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {chapter.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <SectionCard key={section.section_id} section={section} />
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface SectionCardProps {
  section: ChapterSection;
}

function SectionCard({ section }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-blue-600">
              {section.order}
            </span>
          </div>
          <h4 className="font-medium text-gray-900">{section.title}</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs"
        >
          {isExpanded ? "Thu gọn" : "Xem chi tiết"}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 pl-8">
          <div className="text-sm text-gray-700 leading-relaxed">
            {section.content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChapterRecommendations({
  weakestLO,
  className = "",
}: ChapterRecommendationsProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );

  const toggleChapter = (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  if (!weakestLO || !weakestLO.chapters || weakestLO.chapters.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Không có đề xuất chương học nào cho thời điểm này.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-amber-600" />
          Đề xuất chương học cần cải thiện
        </CardTitle>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              Chuẩn đầu ra yếu nhất: {weakestLO.lo_name}
            </span>
          </div>
          <div className="text-sm text-amber-700">
            Độ chính xác hiện tại:{" "}
            <strong>{weakestLO.accuracy.toFixed(1)}%</strong>
          </div>
          <div className="text-xs text-amber-600 mt-2">
            Hãy tập trung ôn tập các chương dưới đây để cải thiện kết quả học
            tập.
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {weakestLO.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.chapter_id}
              chapter={chapter}
              isExpanded={expandedChapters.has(chapter.chapter_id)}
              onToggle={() => toggleChapter(chapter.chapter_id)}
            />
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Gợi ý học tập</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Đọc kỹ nội dung từng phần theo thứ tự</li>
            <li>• Ghi chú những điểm quan trọng</li>
            <li>• Thực hành với các bài tập liên quan</li>
            <li>• Tham khảo thêm tài liệu bổ sung nếu cần</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
