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
  CheckSquare,
  BookOpen,
  Target,
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

import { ploService } from "@/lib/services/api/plo.service";
import { programService } from "@/lib/services/api/program.service";
import { poService } from "@/lib/services/api/po.service";
import type {
  PLOWithRelations,
  Program,
  PO,
} from "@/lib/types/program-management";

interface PLOsDataTableProps {
  className?: string;
}

export function PLOsDataTable({ className }: PLOsDataTableProps) {
  const router = useRouter();

  // State management
  const [plos, setPLOs] = useState<PLOWithRelations[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPLOs, setSelectedPLOs] = useState<number[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedPO, setSelectedPO] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // Load programs and POs for filter dropdowns
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [programsResponse, posResponse] = await Promise.all([
          programService.getPrograms(),
          poService.getPOs(),
        ]);

        if (programsResponse.success) {
          setPrograms(programsResponse.data.records);
        }
        if (posResponse.success) {
          setPOs(posResponse.data.pos);
        }
      } catch (error) {
        console.error("Error loading filter data:", error);
      }
    };
    loadFilters();
  }, []);

  // Load PLOs data
  const loadPLOs = async () => {
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
        po_id: selectedPO !== "all" ? parseInt(selectedPO) : undefined,
      };

      const response = await ploService.getPLOs(params);
      if (response.success) {
        setPLOs(response.data.plos);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalItems);
      }
    } catch (error) {
      console.error("Error loading PLOs:", error);
      toast.error("Không thể tải danh sách chuẩn đầu ra học phần");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPLOs();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedProgram,
    selectedPO,
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
      setSelectedPLOs(plos.map((plo) => plo.plo_id));
    } else {
      setSelectedPLOs([]);
    }
  };

  const handleSelectPLO = (ploId: number, checked: boolean) => {
    if (checked) {
      setSelectedPLOs([...selectedPLOs, ploId]);
    } else {
      setSelectedPLOs(selectedPLOs.filter((id) => id !== ploId));
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
    if (selectedPLOs.length === 0) return;

    try {
      // Implementation for bulk delete
      toast.success(`Đã xóa ${selectedPLOs.length} chuẩn đầu ra học phần`);
      setSelectedPLOs([]);
      loadPLOs();
    } catch (error) {
      toast.error("Không thể xóa các chuẩn đầu ra học phần đã chọn");
    }
  };

  // Filter POs based on selected program
  const filteredPOs = useMemo(() => {
    if (selectedProgram === "all") return pos;
    return pos.filter((po) => po.program_id === parseInt(selectedProgram));
  }, [pos, selectedProgram]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Danh sách chuẩn đầu ra học phần
        </CardTitle>
        <CardDescription>
          Quản lý các chuẩn đầu ra học phần trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên chuẩn đầu ra học phần..."
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
            <Select value={selectedPO} onValueChange={setSelectedPO}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn PO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả PO</SelectItem>
                {filteredPOs.map((po) => (
                  <SelectItem key={po.po_id} value={po.po_id.toString()}>
                    {po.name}
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
        {selectedPLOs.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              Đã chọn {selectedPLOs.length} chuẩn đầu ra học phần
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
                      selectedPLOs.length === plos.length && plos.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("description")}
                    className="h-auto p-0 font-semibold"
                  >
                    Mô tả
                    {renderSortIcon("description")}
                  </Button>
                </TableHead>
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
                <TableHead>PO liên quan</TableHead>
                <TableHead>LOs</TableHead>
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
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : plos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {searchTerm ||
                      selectedProgram !== "all" ||
                      selectedPO !== "all"
                        ? "Không tìm thấy chuẩn đầu ra học phần nào phù hợp"
                        : "Chưa có chuẩn đầu ra học phần nào"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                plos.map((plo) => (
                  <TableRow key={plo.plo_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPLOs.includes(plo.plo_id)}
                        onCheckedChange={(checked) =>
                          handleSelectPLO(plo.plo_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate">
                        {plo.description}
                      </div>
                      {plo.name && (
                        <div className="text-sm text-muted-foreground truncate">
                          {plo.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {plo.Program ? (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 w-fit"
                        >
                          <BookOpen className="h-3 w-3" />
                          {plo.Program.name}
                        </Badge>
                      ) : (
                        "Không xác định"
                      )}
                    </TableCell>
                    <TableCell>
                      {plo.PO ? (
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {plo.PO.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Chưa liên kết
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plo._count?.LOs || 0} LOs
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
                              router.push(`/dashboard/admin/plos/${plo.plo_id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/plos/${plo.plo_id}?edit=true`
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
