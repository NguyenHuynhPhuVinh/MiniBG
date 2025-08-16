"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize,
  Network,
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

interface RelationshipDiagramProps {
  className?: string;
}

interface DiagramNode {
  id: string;
  type: "PO" | "PLO";
  label: string;
  description?: string;
  x: number;
  y: number;
  data: POWithRelations | PLOWithRelations;
}

interface DiagramEdge {
  from: string;
  to: string;
  type: "association";
}

export function RelationshipDiagram({ className }: RelationshipDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [edges, setEdges] = useState<DiagramEdge[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

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

  // Load diagram data when program changes
  useEffect(() => {
    if (selectedProgram === "all") {
      setNodes([]);
      setEdges([]);
      return;
    }

    const loadDiagramData = async () => {
      try {
        setLoading(true);
        const programId = parseInt(selectedProgram);

        const [posResponse, plosResponse] = await Promise.all([
          poService.getPOsByProgram(programId),
          ploService.getPLOsByProgram(programId),
        ]);

        if (posResponse.success && plosResponse.success) {
          const pos = posResponse.data;
          const plos = plosResponse.data;

          // Create nodes
          const newNodes: DiagramNode[] = [];
          const newEdges: DiagramEdge[] = [];

          // Add PO nodes (left side)
          pos.forEach((po: POWithRelations, index: number) => {
            newNodes.push({
              id: `po-${po.po_id}`,
              type: "PO",
              label: po.name,
              description: po.description,
              x: 100,
              y: 100 + index * 120,
              data: po,
            });
          });

          // Add PLO nodes (right side)
          plos.forEach((plo: PLOWithRelations, index: number) => {
            newNodes.push({
              id: `plo-${plo.plo_id}`,
              type: "PLO",
              label: plo.name || `PLO ${plo.plo_id}`,
              description: plo.description,
              x: 500,
              y: 100 + index * 120,
              data: plo,
            });

            // Add edge if PLO is associated with a PO
            if (plo.PO) {
              newEdges.push({
                from: `po-${plo.PO.po_id}`,
                to: `plo-${plo.plo_id}`,
                type: "association",
              });
            }
          });

          setNodes(newNodes);
          setEdges(newEdges);
        }
      } catch (error) {
        console.error("Error loading diagram data:", error);
        toast.error("Không thể tải dữ liệu biểu đồ");
      } finally {
        setLoading(false);
      }
    };

    loadDiagramData();
  }, [selectedProgram]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export diagram
  const handleExportDiagram = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `relationship-diagram-${selectedProgram}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);

    toast.success("Đã xuất biểu đồ thành công");
  };

  // Get node by id
  const getNodeById = (id: string) => nodes.find((node) => node.id === id);

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
          <Network className="h-5 w-5" />
          Biểu đồ mối quan hệ PO-PLO
        </CardTitle>
        <CardDescription>
          Hiển thị mối quan hệ giữa Program Outcomes và Program Learning
          Outcomes
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

            <Badge variant="outline" className="text-xs">
              Zoom: {Math.round(zoom * 100)}%
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDiagram}
              disabled={selectedProgram === "all"}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Diagram */}
        {selectedProgram === "all" ? (
          <div className="text-center py-12 text-muted-foreground">
            <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Vui lòng chọn chương trình đào tạo để xem biểu đồ mối quan hệ</p>
          </div>
        ) : (
          <div className="border rounded-lg bg-background overflow-hidden">
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${600 / zoom}`}
              className="bg-grid-pattern"
            >
              {/* Grid pattern */}
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {edges.map((edge, index) => {
                const fromNode = getNodeById(edge.from);
                const toNode = getNodeById(edge.to);

                if (!fromNode || !toNode) return null;

                return (
                  <line
                    key={index}
                    x1={fromNode.x + 120}
                    y1={fromNode.y + 40}
                    x2={toNode.x}
                    y2={toNode.y + 40}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>

              {/* Nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width="120"
                    height="80"
                    rx="8"
                    fill={node.type === "PO" ? "#dbeafe" : "#dcfce7"}
                    stroke={node.type === "PO" ? "#3b82f6" : "#22c55e"}
                    strokeWidth="2"
                  />

                  {/* Node icon */}
                  {node.type === "PO" ? (
                    <Target
                      x={node.x + 10}
                      y={node.y + 10}
                      width="16"
                      height="16"
                      fill="#3b82f6"
                    />
                  ) : (
                    <CheckSquare
                      x={node.x + 10}
                      y={node.y + 10}
                      width="16"
                      height="16"
                      fill="#22c55e"
                    />
                  )}

                  {/* Node label */}
                  <text
                    x={node.x + 60}
                    y={node.y + 35}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#1f2937"
                  >
                    {node.label.length > 15
                      ? `${node.label.substring(0, 15)}...`
                      : node.label}
                  </text>

                  {/* Node type */}
                  <text
                    x={node.x + 60}
                    y={node.y + 55}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {node.type}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Legend */}
        {selectedProgram !== "all" && (
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
              <span className="text-sm">Program Outcomes (POs)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
              <span className="text-sm">Program Learning Outcomes (PLOs)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-sm">Liên kết</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
