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
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Settings,
  BookOpen,
  Target,
  CheckSquare,
  RefreshCw,
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

interface HierarchyExporterProps {
  className?: string;
}

type ExportFormat = "json" | "csv" | "excel" | "pdf" | "svg";

interface ExportOptions {
  includeDescriptions: boolean;
  includeMetadata: boolean;
  includeStatistics: boolean;
  includeUnassociated: boolean;
}

export function HierarchyExporter({ className }: HierarchyExporterProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeDescriptions: true,
    includeMetadata: true,
    includeStatistics: true,
    includeUnassociated: true,
  });

  // Load programs
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

  // Handle program selection
  const handleSelectProgram = (programId: number, checked: boolean) => {
    if (checked) {
      setSelectedPrograms((prev) => [...prev, programId]);
    } else {
      setSelectedPrograms((prev) => prev.filter((id) => id !== programId));
    }
  };

  const handleSelectAllPrograms = (checked: boolean) => {
    if (checked) {
      setSelectedPrograms(programs.map((p) => p.program_id));
    } else {
      setSelectedPrograms([]);
    }
  };

  // Export functions
  const exportAsJSON = async (data: any) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `hierarchy-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = async (data: any) => {
    const csvRows: string[] = [];

    // Headers
    const headers = [
      "Program ID",
      "Program Name",
      "PO ID",
      "PO Name",
      "PLO ID",
      "PLO Name",
    ];

    if (exportOptions.includeDescriptions) {
      headers.push("Program Description", "PO Description", "PLO Description");
    }

    csvRows.push(headers.join(","));

    // Data rows
    data.programs.forEach((program: any) => {
      program.pos.forEach((po: any) => {
        if (po.plos.length === 0) {
          // PO without PLOs
          const row = [
            program.program_id,
            `"${program.name}"`,
            po.po_id,
            `"${po.name}"`,
            "",
            "",
          ];

          if (exportOptions.includeDescriptions) {
            row.push(
              `"${program.description || ""}"`,
              `"${po.description || ""}"`,
              ""
            );
          }

          csvRows.push(row.join(","));
        } else {
          // PO with PLOs
          po.plos.forEach((plo: any) => {
            const row = [
              program.program_id,
              `"${program.name}"`,
              po.po_id,
              `"${po.name}"`,
              plo.plo_id,
              `"${plo.name || `PLO ${plo.plo_id}`}"`,
            ];

            if (exportOptions.includeDescriptions) {
              row.push(
                `"${program.description || ""}"`,
                `"${po.description || ""}"`,
                `"${plo.description || ""}"`
              );
            }

            csvRows.push(row.join(","));
          });
        }
      });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `hierarchy-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Main export function
  const handleExport = async () => {
    if (selectedPrograms.length === 0) {
      toast.error("Vui lòng chọn ít nhất một chương trình");
      return;
    }

    try {
      setExporting(true);

      // Collect data for selected programs
      const exportData: any = {
        metadata: exportOptions.includeMetadata
          ? {
              exportDate: new Date().toISOString(),
              exportFormat,
              exportOptions,
              totalPrograms: selectedPrograms.length,
            }
          : undefined,
        programs: [],
      };

      // Load data for each selected program
      for (const programId of selectedPrograms) {
        const program = programs.find((p) => p.program_id === programId);
        if (!program) continue;

        const [posResponse, plosResponse] = await Promise.all([
          poService.getPOsByProgram(programId),
          ploService.getPLOsByProgram(programId),
        ]);

        if (posResponse.success && plosResponse.success) {
          const pos = posResponse.data;
          const plos = plosResponse.data;

          const programData: any = {
            program_id: program.program_id,
            name: program.name,
            description: exportOptions.includeDescriptions
              ? program.description
              : undefined,
            pos: [],
          };

          // Add statistics if requested
          if (exportOptions.includeStatistics) {
            programData.statistics = {
              totalPOs: pos.length,
              totalPLOs: plos.length,
              associatedPLOs: plos.filter((plo: PLOWithRelations) => plo.PO)
                .length,
              unassociatedPLOs: plos.filter((plo: PLOWithRelations) => !plo.PO)
                .length,
            };
          }

          // Process POs
          pos.forEach((po: POWithRelations) => {
            const poData: any = {
              po_id: po.po_id,
              name: po.name,
              description: exportOptions.includeDescriptions
                ? po.description
                : undefined,
              plos: [],
            };

            // Add associated PLOs
            const associatedPLOs = plos.filter(
              (plo: PLOWithRelations) => plo.PO && plo.PO.po_id === po.po_id
            );

            associatedPLOs.forEach((plo: PLOWithRelations) => {
              poData.plos.push({
                plo_id: plo.plo_id,
                name: plo.name,
                description: exportOptions.includeDescriptions
                  ? plo.description
                  : undefined,
              });
            });

            programData.pos.push(poData);
          });

          // Add unassociated PLOs if requested
          if (exportOptions.includeUnassociated) {
            const unassociatedPLOs = plos.filter(
              (plo: PLOWithRelations) => !plo.PO
            );
            if (unassociatedPLOs.length > 0) {
              programData.unassociatedPLOs = unassociatedPLOs.map(
                (plo: PLOWithRelations) => ({
                  plo_id: plo.plo_id,
                  name: plo.name,
                  description: exportOptions.includeDescriptions
                    ? plo.description
                    : undefined,
                })
              );
            }
          }

          exportData.programs.push(programData);
        }
      }

      // Export based on format
      switch (exportFormat) {
        case "json":
          await exportAsJSON(exportData);
          break;
        case "csv":
          await exportAsCSV(exportData);
          break;
        case "excel":
          // For now, export as CSV (Excel support would require additional library)
          await exportAsCSV(exportData);
          toast.info("Đã xuất dưới dạng CSV (Excel support sẽ được thêm sau)");
          break;
        default:
          toast.error("Định dạng xuất không được hỗ trợ");
          return;
      }

      toast.success("Đã xuất dữ liệu thành công");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Không thể xuất dữ liệu");
    } finally {
      setExporting(false);
    }
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
          <Download className="h-5 w-5" />
          Xuất cây phân cấp
        </CardTitle>
        <CardDescription>
          Xuất dữ liệu phân cấp chương trình ra nhiều định dạng khác nhau
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Định dạng xuất</h3>
          <Select
            value={exportFormat}
            onValueChange={(value: ExportFormat) => setExportFormat(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  JSON
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (XLSX)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tùy chọn xuất</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={exportOptions.includeDescriptions}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeDescriptions: checked as boolean,
                  }))
                }
              />
              <label className="text-sm">Bao gồm mô tả</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={exportOptions.includeMetadata}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeMetadata: checked as boolean,
                  }))
                }
              />
              <label className="text-sm">Bao gồm metadata</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={exportOptions.includeStatistics}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeStatistics: checked as boolean,
                  }))
                }
              />
              <label className="text-sm">Bao gồm thống kê</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={exportOptions.includeUnassociated}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeUnassociated: checked as boolean,
                  }))
                }
              />
              <label className="text-sm">Bao gồm PLOs chưa liên kết</label>
            </div>
          </div>
        </div>

        {/* Program Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chọn chương trình</h3>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedPrograms.length === programs.length &&
                  programs.length > 0
                }
                onCheckedChange={handleSelectAllPrograms}
              />
              <span className="text-sm">Chọn tất cả</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {programs.map((program) => (
              <div
                key={program.program_id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50"
              >
                <Checkbox
                  checked={selectedPrograms.includes(program.program_id)}
                  onCheckedChange={(checked) =>
                    handleSelectProgram(program.program_id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <div className="font-medium">{program.name}</div>
                  {program.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {program.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Sẽ xuất {selectedPrograms.length} chương trình
              </div>
              <div className="text-sm text-muted-foreground">
                Định dạng: {exportFormat.toUpperCase()}
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={exporting || selectedPrograms.length === 0}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Xuất dữ liệu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
