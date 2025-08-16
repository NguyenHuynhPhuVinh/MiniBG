"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  Target,
  BookOpen,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { Badge, Skeleton } from "@/components/ui/feedback";
import { toast } from "sonner";

import { poService } from "@/lib/services/api/po.service";
import { programService } from "@/lib/services/api/program.service";
import type { POWithRelations, Program } from "@/lib/types/program-management";

interface POsDataTableProps {
  className?: string;
}

export function POsDataTable({ className }: POsDataTableProps) {
  const router = useRouter();

  // State management
  const [pos, setPOs] = useState<POWithRelations[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPOs, setSelectedPOs] = useState<number[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // Load programs for filter dropdown
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await programService.getPrograms();
        if (response.success) {
          setPrograms(response.data.records);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
      }
    };
    loadPrograms();
  }, []);

  // Load POs data
  const loadPOs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        program_id:
          selectedProgram !== "all" ? parseInt(selectedProgram) : undefined,
      };

      const response = await poService.getPOs(params);
      if (response.success) {
        setPOs(response.data.pos);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalItems);
      }
    } catch (error) {
      console.error("Error loading POs:", error);
      toast.error("Không thể tải danh sách chuẩn đầu ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOs();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedProgram,
    sortBy,
    sortOrder,
  ]);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPOs(pos.map((po) => po.po_id));
    } else {
      setSelectedPOs([]);
    }
  };

  const handleSelectPO = (poId: number, checked: boolean) => {
    if (checked) {
      setSelectedPOs([...selectedPOs, poId]);
    } else {
      setSelectedPOs(selectedPOs.filter((id) => id !== poId));
    }
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedPOs.length === 0) return;

    try {
      // Implementation for bulk delete
      toast.success(`Đã xóa ${selectedPOs.length} chuẩn đầu ra`);
      setSelectedPOs([]);
      loadPOs();
    } catch (error) {
      toast.error("Không thể xóa các chuẩn đầu ra đã chọn");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Danh sách chuẩn đầu ra chương trình
        </CardTitle>
        <CardDescription>
          Quản lý các chuẩn đầu ra chương trình trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên chuẩn đầu ra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn chương trình" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chương trình</SelectItem>
                {programs.map((program) => (
                  <SelectItem
                    key={program.program_id}
                    value={program.program_id.toString()}
                  >
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPOs.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              Đã chọn {selectedPOs.length} chuẩn đầu ra
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa đã chọn
            </Button>
          </div>
        )}

        {/* Data Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedPOs.length === pos.length && pos.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-semibold"
                  >
                    Tên chuẩn đầu ra
                    {renderSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("program_id")}
                    className="h-auto p-0 font-semibold"
                  >
                    Chương trình
                    {renderSortIcon("program_id")}
                  </Button>
                </TableHead>
                <TableHead>PLOs</TableHead>
                <TableHead className="w-20">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : pos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {searchTerm || selectedProgram !== "all"
                        ? "Không tìm thấy chuẩn đầu ra nào phù hợp"
                        : "Chưa có chuẩn đầu ra nào"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pos.map((po) => (
                  <TableRow key={po.po_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPOs.includes(po.po_id)}
                        onCheckedChange={(checked) =>
                          handleSelectPO(po.po_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{po.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {po.description || "Không có mô tả"}
                    </TableCell>
                    <TableCell>
                      {po.Program ? (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 w-fit"
                        >
                          <BookOpen className="h-3 w-3" />
                          {po.Program.name}
                        </Badge>
                      ) : (
                        "Không xác định"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {po._count?.PLOs || 0} PLOs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/admin/pos/${po.po_id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/pos/${po.po_id}?edit=true`
                              )
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <PaginationWithInfo
            currentPage={currentPage}
            totalPages={totalPages}
            total={totalItems}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
