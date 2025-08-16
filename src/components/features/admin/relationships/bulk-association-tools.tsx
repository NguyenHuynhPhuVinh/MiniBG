"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import {
  Target,
  CheckSquare,
  BookOpen,
  Link,
  Unlink,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { poService } from "@/lib/services/api/po.service";
import { ploService } from "@/lib/services/api/plo.service";
import { programService } from "@/lib/services/api/program.service";
import type {
  POWithRelations,
  PLOWithRelations,
  Program,
} from "@/lib/types/program-management";

interface BulkAssociationToolsProps {
  className?: string;
}

interface BulkOperation {
  type: "associate" | "disassociate";
  poId: number;
  ploIds: number[];
}

export function BulkAssociationTools({ className }: BulkAssociationToolsProps) {
  // State management
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [pos, setPOs] = useState<POWithRelations[]>([]);
  const [plos, setPLOs] = useState<PLOWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Selection states
  const [selectedPOs, setSelectedPOs] = useState<number[]>([]);
  const [selectedPLOs, setSelectedPLOs] = useState<number[]>([]);
  const [operationType, setOperationType] = useState<
    "associate" | "disassociate"
  >("associate");

  // Load initial data
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await programService.getPrograms();
        if (response.success) {
          setPrograms(response.data.records);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
        toast.error("Không thể tải danh sách chương trình");
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  // Load program data
  useEffect(() => {
    if (selectedProgram === "all") {
      setPOs([]);
      setPLOs([]);
      setSelectedPOs([]);
      setSelectedPLOs([]);
      return;
    }

    const loadProgramData = async () => {
      try {
        setLoading(true);
        const programId = parseInt(selectedProgram);

        const [posResponse, plosResponse] = await Promise.all([
          poService.getPOsByProgram(programId),
          ploService.getPLOsByProgram(programId),
        ]);

        if (posResponse.success) {
          setPOs(posResponse.data);
        }

        if (plosResponse.success) {
          setPLOs(plosResponse.data);
        }
      } catch (error) {
        console.error("Error loading program data:", error);
        toast.error("Không thể tải dữ liệu chương trình");
      } finally {
        setLoading(false);
      }
    };

    loadProgramData();
  }, [selectedProgram]);

  // Selection handlers
  const handleSelectAllPOs = (checked: boolean) => {
    if (checked) {
      setSelectedPOs(pos.map((po) => po.po_id));
    } else {
      setSelectedPOs([]);
    }
  };

  const handleSelectPO = (poId: number, checked: boolean) => {
    if (checked) {
      setSelectedPOs((prev) => [...prev, poId]);
    } else {
      setSelectedPOs((prev) => prev.filter((id) => id !== poId));
    }
  };

  const handleSelectAllPLOs = (checked: boolean) => {
    if (checked) {
      setSelectedPLOs(plos.map((plo) => plo.plo_id));
    } else {
      setSelectedPLOs([]);
    }
  };

  const handleSelectPLO = (ploId: number, checked: boolean) => {
    if (checked) {
      setSelectedPLOs((prev) => [...prev, ploId]);
    } else {
      setSelectedPLOs((prev) => prev.filter((id) => id !== ploId));
    }
  };

  // Bulk operations
  const handleBulkOperation = async () => {
    if (selectedPOs.length === 0 || selectedPLOs.length === 0) {
      toast.error("Vui lòng chọn ít nhất một PO và một PLO");
      return;
    }

    try {
      setProcessing(true);
      const operations: Promise<any>[] = [];

      selectedPOs.forEach((poId) => {
        selectedPLOs.forEach((ploId) => {
          if (operationType === "associate") {
            operations.push(ploService.associateWithPO(ploId, poId));
          } else {
            operations.push(ploService.disassociateFromPO(ploId, poId));
          }
        });
      });

      await Promise.all(operations);

      const operationText =
        operationType === "associate" ? "liên kết" : "hủy liên kết";
      toast.success(
        `Đã ${operationText} ${selectedPOs.length} PO(s) với ${selectedPLOs.length} PLO(s)`
      );

      // Reload data
      const programId = parseInt(selectedProgram);
      const [posResponse, plosResponse] = await Promise.all([
        poService.getPOsByProgram(programId),
        ploService.getPLOsByProgram(programId),
      ]);

      if (posResponse.success) setPOs(posResponse.data);
      if (plosResponse.success) setPLOs(plosResponse.data);

      // Clear selections
      setSelectedPOs([]);
      setSelectedPLOs([]);
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      toast.error("Không thể thực hiện thao tác hàng loạt");
    } finally {
      setProcessing(false);
    }
  };

  // Get association status
  const getAssociationCount = () => {
    let count = 0;
    selectedPOs.forEach((poId) => {
      selectedPLOs.forEach((ploId) => {
        const plo = plos.find((p) => p.plo_id === ploId);
        if (plo && plo.PO && plo.PO.po_id === poId) {
          count++;
        }
      });
    });
    return count;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Công cụ liên kết hàng loạt
        </CardTitle>
        <CardDescription>
          Thực hiện liên kết hoặc hủy liên kết hàng loạt giữa POs và PLOs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program Selection and Operation Type */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn chương trình đào tạo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Chọn chương trình</SelectItem>
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
          </div>

          <Select
            value={operationType}
            onValueChange={(value: "associate" | "disassociate") =>
              setOperationType(value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="associate">
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Liên kết
                </div>
              </SelectItem>
              <SelectItem value="disassociate">
                <div className="flex items-center gap-2">
                  <Unlink className="h-4 w-4" />
                  Hủy liên kết
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedProgram === "all" ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Vui lòng chọn chương trình đào tạo để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Operation Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    Thao tác:{" "}
                    {operationType === "associate"
                      ? "Liên kết"
                      : "Hủy liên kết"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPOs.length} PO(s) × {selectedPLOs.length} PLO(s) ={" "}
                    {selectedPOs.length * selectedPLOs.length} thao tác
                  </div>
                  {operationType === "associate" && (
                    <div className="text-sm text-muted-foreground">
                      Đã liên kết: {getAssociationCount()} /{" "}
                      {selectedPOs.length * selectedPLOs.length}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleBulkOperation}
                  disabled={
                    processing ||
                    selectedPOs.length === 0 ||
                    selectedPLOs.length === 0
                  }
                  className="flex items-center gap-2"
                >
                  {processing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : operationType === "associate" ? (
                    <Link className="h-4 w-4" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  {operationType === "associate"
                    ? "Liên kết hàng loạt"
                    : "Hủy liên kết hàng loạt"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* POs Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Program Outcomes</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedPOs.length === pos.length && pos.length > 0
                      }
                      onCheckedChange={handleSelectAllPOs}
                    />
                    <span className="text-sm">Chọn tất cả</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pos.map((po) => (
                    <div
                      key={po.po_id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50"
                    >
                      <Checkbox
                        checked={selectedPOs.includes(po.po_id)}
                        onCheckedChange={(checked) =>
                          handleSelectPO(po.po_id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <div className="font-medium">{po.name}</div>
                        {po.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {po.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PLOs Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Program Learning Outcomes
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedPLOs.length === plos.length && plos.length > 0
                      }
                      onCheckedChange={handleSelectAllPLOs}
                    />
                    <span className="text-sm">Chọn tất cả</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {plos.map((plo) => (
                    <div
                      key={plo.plo_id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50"
                    >
                      <Checkbox
                        checked={selectedPLOs.includes(plo.plo_id)}
                        onCheckedChange={(checked) =>
                          handleSelectPLO(plo.plo_id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {plo.name || `PLO ${plo.plo_id}`}
                        </div>
                        {plo.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {plo.description}
                          </div>
                        )}
                        {plo.PO && (
                          <Badge variant="outline" className="text-xs mt-1">
                            <Target className="h-3 w-3 mr-1" />
                            {plo.PO.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
