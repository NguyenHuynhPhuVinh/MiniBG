"use client";

import React, { useState } from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import {
  Link,
  Network,
  Settings,
  TreePine,
  Download,
} from "lucide-react";

import {
  POPLOAssociationInterface,
  RelationshipDiagram,
  BulkAssociationTools,
  ProgramHierarchyViewer,
  HierarchyExporter,
} from "@/components/features/admin/relationships";

export default function RelationshipsPage() {
  const [activeTab, setActiveTab] = useState("association");

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Network className="h-8 w-8" />
              Quản lý mối quan hệ
            </h1>
            <p className="text-muted-foreground">
              Quản lý mối quan hệ giữa Program Outcomes và Program Learning Outcomes
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="association" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Liên kết PO-PLO
            </TabsTrigger>
            <TabsTrigger value="diagram" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Biểu đồ mối quan hệ
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Công cụ hàng loạt
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Cây phân cấp
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Xuất dữ liệu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="association" className="space-y-6">
            <POPLOAssociationInterface />
          </TabsContent>

          <TabsContent value="diagram" className="space-y-6">
            <RelationshipDiagram />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <BulkAssociationTools />
          </TabsContent>

          <TabsContent value="hierarchy" className="space-y-6">
            <ProgramHierarchyViewer />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <HierarchyExporter />
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
}
