// Program Management TypeScript types and interfaces
// Hierarchical structure: Program → PO → PLO → LO

import type { Course } from "./course";

// ===== PROGRAM TYPES =====

export interface Program {
  program_id: number;
  name: string;
  description?: string;
  // Optional fields that may not be present in current API
  code?: string;
  duration_years?: number;
  created_at?: string;
  updated_at?: string;
  // Relations from API response
  POs?: PO[];
  PLOs?: PLO[];
  Courses?: Course[];
}

export interface ProgramWithRelations extends Program {
  POs?: PO[];
  PLOs?: PLO[];
  Courses?: Course[];
  _count?: {
    POs: number;
    PLOs: number;
    Courses: number;
  };
}

export interface ProgramListResponse {
  success: boolean;
  data: {
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
    records: Program[];
  };
  message?: string;
}

export interface ProgramCreateRequest {
  name: string;
  description?: string;
}

export interface ProgramUpdateRequest extends Partial<ProgramCreateRequest> {}

// ===== PROGRAM API RESPONSE TYPES =====

export interface ProgramApiResponse {
  success: boolean;
  data: Program;
  message?: string;
}

export interface ProgramWithRelationsApiResponse {
  success: boolean;
  data: ProgramWithRelations;
  message?: string;
}

export interface ProgramPOsApiResponse {
  success: boolean;
  data: PO[];
  message?: string;
}

export interface ProgramPLOsApiResponse {
  success: boolean;
  data: PLO[];
  message?: string;
}

export interface ProgramCoursesApiResponse {
  success: boolean;
  data: Course[];
  message?: string;
}

export interface ProgramStatisticsApiResponse {
  success: boolean;
  data: {
    total_pos: number;
    total_plos: number;
    total_courses: number;
    total_students: number;
    completion_rate: number;
  };
  message?: string;
}

export interface ProgramDeleteApiResponse {
  success: boolean;
  message?: string;
}

// ===== PO (Program Outcome) TYPES =====

export interface PO {
  po_id: number;
  name: string;
  description?: string;
  code?: string;
  program_id: number;
  created_at: string;
  updated_at: string;
}

export interface POWithRelations extends PO {
  Program?: Program;
  PLOs?: PLO[];
  _count?: {
    PLOs: number;
  };
}

export interface POListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pos: PO[];
  };
  message?: string;
}

export interface POCreateRequest {
  name: string;
  description?: string;
  code?: string;
  program_id: number;
}

export interface POUpdateRequest extends Partial<POCreateRequest> {}

// ===== PO API RESPONSE TYPES =====

export interface POApiResponse {
  success: boolean;
  data: PO;
  message?: string;
}

export interface POWithRelationsApiResponse {
  success: boolean;
  data: POWithRelations;
  message?: string;
}

export interface POsByProgramApiResponse {
  success: boolean;
  data: PO[];
  message?: string;
}

export interface POPLOsApiResponse {
  success: boolean;
  data: PLO[];
  message?: string;
}

export interface POStatisticsApiResponse {
  success: boolean;
  data: {
    total_plos: number;
    total_los: number;
    completion_rate: number;
    average_score: number;
  };
  message?: string;
}

export interface PODeleteApiResponse {
  success: boolean;
  message?: string;
}

export interface POBulkApiResponse {
  success: boolean;
  data: PO[];
  message?: string;
}

// ===== PLO (Program Learning Outcome) TYPES =====

export interface PLO {
  plo_id: number;
  name: string;
  description?: string;
  code?: string;
  program_id: number;
  po_id?: number;
  created_at: string;
  updated_at: string;
}

export interface PLOWithRelations extends PLO {
  Program?: Program;
  PO?: PO;
  LOs?: LO[];
  _count?: {
    LOs: number;
  };
}

export interface PLOListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    plos: PLO[];
  };
  message?: string;
}

export interface PLOCreateRequest {
  name: string;
  description?: string;
  code?: string;
  program_id: number;
  po_id?: number;
}

export interface PLOUpdateRequest extends Partial<PLOCreateRequest> {}

// ===== LO (Learning Outcome) TYPES =====
// Note: LO service already exists, these are for consistency

export interface LO {
  lo_id: number;
  name: string;
  description?: string;
  subject_id?: number;
  plo_id?: number;
  created_at: string;
  updated_at: string;
}

// ===== COURSE TYPES =====
// Moved to separate course.ts file as per requirements

// ===== PAGINATION PARAMS =====

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

// ===== API RESPONSE WRAPPERS =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

// ===== FILTER PARAMS =====

export interface ProgramFilterParams extends PaginationParams {
  duration_years?: number;
}

export interface POFilterParams extends PaginationParams {
  program_id?: number;
}

export interface PLOFilterParams extends PaginationParams {
  program_id?: number;
  po_id?: number;
}
