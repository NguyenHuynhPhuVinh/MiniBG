import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Subject } from "@/lib/types/quiz";

interface QuizSearchProps {
  searchTerm: string;
  onChange: (value: string) => void;
  total: number;
  // Filter props
  status?: string;
  onStatusChange: (status: string) => void;
  subjectId?: number;
  onSubjectChange: (subjectId: number | undefined) => void;
  subjects: Subject[];
  // Sort props
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (sortOrder: "ASC" | "DESC") => void;
  // Clear filters
  onClearFilters: () => void;
}

export function QuizSearch({
  searchTerm,
  onChange,
  total,
  status,
  onStatusChange,
  subjectId,
  onSubjectChange,
  subjects,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: QuizSearchProps) {
  const hasActiveFilters = status || subjectId || searchTerm;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ bắt đầu";
      case "active":
        return "Đang diễn ra";
      case "finished":
        return "Đã kết thúc";
      default:
        return "Tất cả";
    }
  };

  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      {/* Header with total count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <p className="text-base sm:text-lg font-medium mb-3 sm:mb-0">
          Tổng cộng có{" "}
          <span className="text-primary font-semibold">{total}</span> bài kiểm
          tra
        </p>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative w-full max-w-xl mb-4">
        <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài kiểm tra theo tên..."
          className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 rounded-full focus-visible:ring-primary/20"
          value={searchTerm}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              onStatusChange(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ bắt đầu</SelectItem>
              <SelectItem value="active">Đang diễn ra</SelectItem>
              <SelectItem value="finished">Đã kết thúc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject Filter */}
        <Select
          value={subjectId?.toString() || "all"}
          onValueChange={(value) =>
            onSubjectChange(value === "all" ? undefined : parseInt(value))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Môn học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả môn học</SelectItem>
            {subjects.map((subject) => (
              <SelectItem
                key={subject.subject_id}
                value={subject.subject_id.toString()}
              >
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="update_time">Thời gian cập nhật</SelectItem>
              <SelectItem value="name">Tên</SelectItem>
              <SelectItem value="status">Trạng thái</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onSortOrderChange(sortOrder === "ASC" ? "DESC" : "ASC")
            }
            className="px-2"
          >
            {sortOrder === "ASC" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {status && (
            <Badge variant="secondary" className="text-xs">
              Trạng thái: {getStatusLabel(status)}
            </Badge>
          )}
          {subjectId && (
            <Badge variant="secondary" className="text-xs">
              Môn:{" "}
              {subjects.find((s) => s.subject_id === subjectId)?.name || "N/A"}
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Tìm kiếm: &quot;{searchTerm}&quot;
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
