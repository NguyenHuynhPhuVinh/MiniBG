"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
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
  Search,
  Link,
  Unlink,
  Save,
  RefreshCw,
  ArrowRight,
  Plus,
  Minus,
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

interface POPLOAssociationInterfaceProps {
  className?: string;
}

interface DragItem {
  id: number;
  type: "PO" | "PLO";
  data: POWithRelations | PLOWithRelations;
}

export function POPLOAssociationInterface({
  className,
}: POPLOAssociationInterfaceProps) {
  // State management
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [pos, setPOs] = useState<POWithRelations[]>([]);
  const [plos, setPLOs] = useState<PLOWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search states
  const [poSearch, setPOSearch] = useState("");
  const [ploSearch, setPLOSearch] = useState("");

  // Drag and drop states
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [associations, setAssociations] = useState<Map<number, number[]>>(
    new Map()
  );

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [programsResponse] = await Promise.all([
          programService.getPrograms(),
        ]);

        if (programsResponse.success) {
          setPrograms(programsResponse.data.records);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load POs and PLOs when program changes
  useEffect(() => {
    if (selectedProgram === "all") {
      setPOs([]);
      setPLOs([]);
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
          // Initialize associations map
          const newAssociations = new Map<number, number[]>();
          posResponse.data.forEach((po: POWithRelations) => {
            newAssociations.set(po.po_id, []);
          });
          setAssociations(newAssociations);
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

  // Filter functions
  const filteredPOs = pos.filter(
    (po) =>
      po.name.toLowerCase().includes(poSearch.toLowerCase()) ||
      (po.description &&
        po.description.toLowerCase().includes(poSearch.toLowerCase()))
  );

  const filteredPLOs = plos.filter(
    (plo) =>
      (plo.name && plo.name.toLowerCase().includes(ploSearch.toLowerCase())) ||
      (plo.description &&
        plo.description.toLowerCase().includes(ploSearch.toLowerCase()))
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDrop = useCallback(
    (targetPOId: number) => {
      if (!draggedItem || draggedItem.type !== "PLO") return;

      const ploId = draggedItem.id;
      const newAssociations = new Map(associations);
      const currentPLOs = newAssociations.get(targetPOId) || [];

      if (!currentPLOs.includes(ploId)) {
        newAssociations.set(targetPOId, [...currentPLOs, ploId]);
        setAssociations(newAssociations);
        toast.success("Đã liên kết PLO với PO");
      }
    },
    [draggedItem, associations]
  );

  const handleRemoveAssociation = useCallback(
    (poId: number, ploId: number) => {
      const newAssociations = new Map(associations);
      const currentPLOs = newAssociations.get(poId) || [];
      newAssociations.set(
        poId,
        currentPLOs.filter((id) => id !== ploId)
      );
      setAssociations(newAssociations);
      toast.success("Đã hủy liên kết PLO với PO");
    },
    [associations]
  );

  const handleSaveAssociations = async () => {
    try {
      setSaving(true);

      // Convert associations map to API calls
      const promises: Promise<any>[] = [];

      associations.forEach((ploIds, poId) => {
        ploIds.forEach((ploId) => {
          promises.push(ploService.associateWithPO(ploId, poId));
        });
      });

      await Promise.all(promises);
      toast.success("Đã lưu tất cả liên kết thành công");
    } catch (error) {
      console.error("Error saving associations:", error);
      toast.error("Không thể lưu liên kết");
    } finally {
      setSaving(false);
    }
  };

  const getAssociatedPLOs = (poId: number) => {
    const ploIds = associations.get(poId) || [];
    return plos.filter((plo) => ploIds.includes(plo.plo_id));
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
          <Link className="h-5 w-5" />
          Quản lý liên kết PO-PLO
        </CardTitle>
        <CardDescription>
          Kéo thả PLO vào PO để tạo liên kết. Sử dụng drag-and-drop để quản lý
          mối quan hệ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program Selection */}
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
          <Button
            onClick={handleSaveAssociations}
            disabled={saving || selectedProgram === "all"}
            className="flex items-center gap-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu liên kết
          </Button>
        </div>

        {selectedProgram === "all" ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              Vui lòng chọn chương trình đào tạo để bắt đầu quản lý liên kết
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* POs Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Program Outcomes (POs)
                </h3>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm PO..."
                  value={poSearch}
                  onChange={(e) => setPOSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredPOs.map((po) => (
                  <div
                    key={po.po_id}
                    className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(po.po_id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{po.name}</h4>
                        {po.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {po.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Associated PLOs */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        PLOs liên kết:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getAssociatedPLOs(po.po_id).map((plo) => (
                          <Badge
                            key={plo.plo_id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <CheckSquare className="h-3 w-3" />
                            {plo.name || `PLO ${plo.plo_id}`}
                            <button
                              onClick={() =>
                                handleRemoveAssociation(po.po_id, plo.plo_id)
                              }
                              className="ml-1 hover:text-destructive"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {getAssociatedPLOs(po.po_id).length === 0 && (
                          <span className="text-sm text-muted-foreground">
                            Chưa có PLO nào được liên kết
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PLOs Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Program Learning Outcomes (PLOs)
                </h3>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm PLO..."
                  value={ploSearch}
                  onChange={(e) => setPLOSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredPLOs.map((plo) => (
                  <div
                    key={plo.plo_id}
                    draggable
                    onDragStart={() =>
                      handleDragStart({
                        id: plo.plo_id,
                        type: "PLO",
                        data: plo,
                      })
                    }
                    onDragEnd={handleDragEnd}
                    className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-move"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {plo.name || `PLO ${plo.plo_id}`}
                        </h4>
                        {plo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {plo.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {plo.PO && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Đã liên kết: {plo.PO.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
