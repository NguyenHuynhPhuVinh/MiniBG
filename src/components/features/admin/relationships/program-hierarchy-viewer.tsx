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
  ChevronDown,
  ChevronRight,
  TreePine,
  Expand,
  Minimize,
  Download,
  Eye,
  EyeOff,
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

interface ProgramHierarchyViewerProps {
  className?: string;
}

interface HierarchyNode {
  id: string;
  type: "program" | "po" | "plo";
  label: string;
  description?: string;
  data: Program | POWithRelations | PLOWithRelations;
  children: HierarchyNode[];
  expanded: boolean;
  level: number;
}

export function ProgramHierarchyViewer({
  className,
}: ProgramHierarchyViewerProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showDescriptions, setShowDescriptions] = useState(true);

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

  // Build hierarchy tree when program changes
  useEffect(() => {
    if (selectedProgram === "all") {
      setHierarchyTree([]);
      return;
    }

    const buildHierarchyTree = async () => {
      try {
        setLoading(true);
        const programId = parseInt(selectedProgram);
        const program = programs.find((p) => p.program_id === programId);

        if (!program) return;

        const [posResponse, plosResponse] = await Promise.all([
          poService.getPOsByProgram(programId),
          ploService.getPLOsByProgram(programId),
        ]);

        if (posResponse.success && plosResponse.success) {
          const pos = posResponse.data;
          const plos = plosResponse.data;

          // Build tree structure
          const programNode: HierarchyNode = {
            id: `program-${program.program_id}`,
            type: "program",
            label: program.name,
            description: program.description,
            data: program,
            children: [],
            expanded: true,
            level: 0,
          };

          // Add PO nodes
          pos.forEach((po: POWithRelations) => {
            const poNode: HierarchyNode = {
              id: `po-${po.po_id}`,
              type: "po",
              label: po.name,
              description: po.description,
              data: po,
              children: [],
              expanded: false,
              level: 1,
            };

            // Add associated PLOs as children
            const associatedPLOs = plos.filter(
              (plo: PLOWithRelations) => plo.PO && plo.PO.po_id === po.po_id
            );

            associatedPLOs.forEach((plo: PLOWithRelations) => {
              const ploNode: HierarchyNode = {
                id: `plo-${plo.plo_id}`,
                type: "plo",
                label: plo.name || `PLO ${plo.plo_id}`,
                description: plo.description,
                data: plo,
                children: [],
                expanded: false,
                level: 2,
              };
              poNode.children.push(ploNode);
            });

            programNode.children.push(poNode);
          });

          // Add unassociated PLOs
          const unassociatedPLOs = plos.filter(
            (plo: PLOWithRelations) => !plo.PO
          );
          if (unassociatedPLOs.length > 0) {
            const unassociatedNode: HierarchyNode = {
              id: "unassociated-plos",
              type: "po",
              label: "PLOs chưa liên kết",
              description: "Các PLO chưa được liên kết với PO nào",
              data: {} as POWithRelations,
              children: [],
              expanded: false,
              level: 1,
            };

            unassociatedPLOs.forEach((plo: PLOWithRelations) => {
              const ploNode: HierarchyNode = {
                id: `plo-${plo.plo_id}`,
                type: "plo",
                label: plo.name || `PLO ${plo.plo_id}`,
                description: plo.description,
                data: plo,
                children: [],
                expanded: false,
                level: 2,
              };
              unassociatedNode.children.push(ploNode);
            });

            programNode.children.push(unassociatedNode);
          }

          setHierarchyTree([programNode]);
          setExpandedNodes(new Set([programNode.id]));
        }
      } catch (error) {
        console.error("Error building hierarchy tree:", error);
        toast.error("Không thể tải cây phân cấp");
      } finally {
        setLoading(false);
      }
    };

    buildHierarchyTree();
  }, [selectedProgram, programs]);

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Expand all nodes
  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectNodeIds = (nodes: HierarchyNode[]) => {
      nodes.forEach((node) => {
        allNodeIds.add(node.id);
        collectNodeIds(node.children);
      });
    };
    collectNodeIds(hierarchyTree);
    setExpandedNodes(allNodeIds);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Export hierarchy
  const exportHierarchy = () => {
    const exportData = {
      program: selectedProgram,
      timestamp: new Date().toISOString(),
      hierarchy: hierarchyTree,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `program-hierarchy-${selectedProgram}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Đã xuất cây phân cấp thành công");
  };

  // Render tree node
  const renderTreeNode = (node: HierarchyNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const indent = node.level * 24;

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded cursor-pointer"
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => hasChildren && toggleNodeExpansion(node.id)}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Node Icon */}
          <div className="w-5 h-5 flex items-center justify-center">
            {node.type === "program" && (
              <BookOpen className="h-4 w-4 text-blue-600" />
            )}
            {node.type === "po" && (
              <Target className="h-4 w-4 text-green-600" />
            )}
            {node.type === "plo" && (
              <CheckSquare className="h-4 w-4 text-purple-600" />
            )}
          </div>

          {/* Node Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{node.label}</span>
              {node.type === "po" && node.children.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {node.children.length} PLOs
                </Badge>
              )}
            </div>
            {showDescriptions && node.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {node.description}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>{node.children.map((child) => renderTreeNode(child))}</div>
        )}
      </div>
    );
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
          <TreePine className="h-5 w-5" />
          Cây phân cấp chương trình
        </CardTitle>
        <CardDescription>
          Hiển thị cấu trúc phân cấp của chương trình, POs và PLOs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[300px]">
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDescriptions(!showDescriptions)}
            >
              {showDescriptions ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={expandAll}>
              <Expand className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              <Minimize className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportHierarchy}
              disabled={selectedProgram === "all"}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tree View */}
        {selectedProgram === "all" ? (
          <div className="text-center py-12 text-muted-foreground">
            <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Vui lòng chọn chương trình đào tạo để xem cây phân cấp</p>
          </div>
        ) : (
          <div className="border rounded-lg bg-background max-h-96 overflow-y-auto">
            {hierarchyTree.map((node) => renderTreeNode(node))}
          </div>
        )}

        {/* Legend */}
        {selectedProgram !== "all" && (
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Chương trình</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm">Program Outcomes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Program Learning Outcomes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
