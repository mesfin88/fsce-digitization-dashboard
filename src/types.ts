export type Role =
  | "archive_staff" | "scanning_operator" | "scanning_supervisor"
  | "editing_operator" | "editing_supervisor" | "qc_officer"
  | "archive_head" | "ict_admin";

export type WorkflowStage =
  | "allocated" | "scanning" | "scanned" | "editing" | "qc_pending"
  | "returned_for_correction" | "qc_approved" | "dspace_pending"
  | "department_approval" | "published" | "exception";

export interface CaseRecord {
  id: string;
  caseNo: string;
  caseLevel?: string;
  caseType?: string;
  plaintiff?: string;
  defendant?: string;
  judgePages: number;
  otherPages: number;
  stage: WorkflowStage;
  scanner?: string;
  editor?: string;
  updatedAt: string;
  notes?: string;
  dspaceHandle?: string;
}

export interface DashboardSummary {
  allocated: number;
  scanning: number;
  editing: number;
  qcPending: number;
  returned: number;
  approved: number;
  published: number;
  exceptions: number;
}

export const STAGE_LABELS: Record<WorkflowStage, string> = {
  allocated: "Allocated", scanning: "Scanning", scanned: "Scanned",
  editing: "Editing", qc_pending: "QC pending",
  returned_for_correction: "Returned for correction", qc_approved: "QC approved",
  dspace_pending: "DSpace submission", department_approval: "Final approval",
  published: "Published", exception: "Exception"
};

export const ROLE_LABELS: Record<Role, string> = {
  archive_staff: "Archive Staff", scanning_operator: "Scanning Operator",
  scanning_supervisor: "Scanning Supervisor", editing_operator: "Editing Operator",
  editing_supervisor: "Editing Supervisor", qc_officer: "Quality Control",
  archive_head: "Archive Department Head", ict_admin: "ICT Administrator"
};