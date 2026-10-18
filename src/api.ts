import type { CaseRecord, DashboardSummary, WorkflowStage } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const DEMO = (import.meta.env.VITE_USE_DEMO_DATA ?? "true").toLowerCase() === "true";

const demoCases: CaseRecord[] = [
  { id: "1", caseNo: "205642", caseLevel: "Cassation", caseType: "Civil", plaintiff: "Example Plaintiff", defendant: "Example Defendant", judgePages: 5, otherPages: 78, stage: "scanned", scanner: "Operator 01", updatedAt: "2026-10-18T09:30:00" },
  { id: "2", caseNo: "205643", caseLevel: "Appeal", caseType: "Criminal", judgePages: 12, otherPages: 34, stage: "editing", scanner: "Operator 02", editor: "Editor 03", updatedAt: "2026-10-18T09:10:00" },
  { id: "3", caseNo: "205644", caseLevel: "Cassation", caseType: "Civil", judgePages: 8, otherPages: 21, stage: "qc_pending", scanner: "Operator 01", editor: "Editor 02", updatedAt: "2026-10-18T08:50:00" },
  { id: "4", caseNo: "205645", caseLevel: "Appeal", caseType: "Labor", judgePages: 15, otherPages: 42, stage: "qc_approved", scanner: "Operator 04", editor: "Editor 01", updatedAt: "2026-10-17T16:40:00" },
  { id: "5", caseNo: "205646", caseLevel: "Cassation", caseType: "Civil", judgePages: 9, otherPages: 17, stage: "returned_for_correction", scanner: "Operator 03", editor: "Editor 04", updatedAt: "2026-10-17T15:20:00", notes: "Pages 6–8 are out of order." },
  { id: "6", caseNo: "205647", caseLevel: "Cassation", caseType: "Commercial", judgePages: 11, otherPages: 26, stage: "dspace_pending", scanner: "Operator 02", editor: "Editor 02", updatedAt: "2026-10-17T14:05:00" },
  { id: "7", caseNo: "205648", caseLevel: "Appeal", caseType: "Civil", judgePages: 7, otherPages: 19, stage: "department_approval", scanner: "Operator 01", editor: "Editor 01", updatedAt: "2026-10-17T12:00:00" },
  { id: "8", caseNo: "205649", caseLevel: "Cassation", caseType: "Civil", judgePages: 14, otherPages: 31, stage: "published", scanner: "Operator 03", editor: "Editor 02", updatedAt: "2026-10-16T11:00:00", dspaceHandle: "123456789/31029" },
  { id: "9", caseNo: "205650", caseLevel: "Cassation", caseType: "Criminal", judgePages: 0, otherPages: 0, stage: "allocated", updatedAt: "2026-10-18T10:10:00" },
  { id: "10", caseNo: "205651", caseLevel: "Appeal", caseType: "Civil", judgePages: 0, otherPages: 0, stage: "scanning", scanner: "Operator 05", updatedAt: "2026-10-18T10:00:00" },
];

let localCases = [...demoCases];
const wait = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) }
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`API ${response.status}: ${message || response.statusText}`);
  }
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export const api = {
  async getCases(): Promise<CaseRecord[]> {
    if (DEMO) { await wait(); return [...localCases]; }
    const data = await request<any>("/api/cases");
    return (data.items ?? data).map(normalizeCase);
  },
  async getSummary(): Promise<DashboardSummary> {
    if (DEMO) {
      await wait();
      return {
        allocated: localCases.filter(c => c.stage === "allocated").length,
        scanning: localCases.filter(c => c.stage === "scanning").length,
        editing: localCases.filter(c => c.stage === "editing" || c.stage === "scanned").length,
        qcPending: localCases.filter(c => c.stage === "qc_pending").length,
        returned: localCases.filter(c => c.stage === "returned_for_correction").length,
        approved: localCases.filter(c => ["qc_approved", "dspace_pending", "department_approval"].includes(c.stage)).length,
        published: localCases.filter(c => c.stage === "published").length,
        exceptions: localCases.filter(c => c.stage === "exception").length
      };
    }
    return request<DashboardSummary>("/api/dashboard/summary");
  },
  async lookupCcms(caseNo: string) {
    if (DEMO) {
      await wait();
      const c = localCases.find(x => x.caseNo === caseNo);
      return c ? { caseNo: c.caseNo, caseLevel: c.caseLevel, caseType: c.caseType, plaintiff: c.plaintiff, defendant: c.defendant } : null;
    }
    // Backend should call the legacy SQL Server 2000 stored procedure sp_getdetals.
    return request<any>(`/api/ccms/cases/${encodeURIComponent(caseNo)}`);
  },
  async transition(caseId: string, action: string, payload: Record<string, unknown> = {}) {
    if (DEMO) {
      await wait();
      const item = localCases.find(c => c.id === caseId);
      if (!item) throw new Error("Case not found");
      const next: Record<string, WorkflowStage> = {
        start_scanning: "scanning", finish_scanning: "scanned", start_editing: "editing",
        submit_qc: "qc_pending", return_for_correction: "returned_for_correction",
        approve_qc: "qc_approved", submit_dspace: "dspace_pending",
        forward_for_approval: "department_approval", publish: "published",
        allocate: "allocated"
      };
      if (next[action]) item.stage = next[action];
      if (typeof payload.notes === "string") item.notes = payload.notes;
      if (action === "publish") item.dspaceHandle = item.dspaceHandle || "123456789/demo";
      item.updatedAt = new Date().toISOString();
      return item;
    }
    return request<CaseRecord>(`/api/cases/${encodeURIComponent(caseId)}/workflow`, {
      method: "POST", body: JSON.stringify({ action, ...payload })
    });
  }
};

function normalizeCase(raw: any): CaseRecord {
  return {
    id: String(raw.id ?? raw.uuid ?? raw.case_no),
    caseNo: String(raw.caseNo ?? raw.case_no ?? ""),
    caseLevel: raw.caseLevel ?? raw.case_level,
    caseType: raw.caseType ?? raw.case_type,
    plaintiff: raw.plaintiff,
    defendant: raw.defendant,
    judgePages: Number(raw.judgePages ?? raw.judge_pages ?? 0),
    otherPages: Number(raw.otherPages ?? raw.other_pages ?? 0),
    stage: (raw.stage ?? raw.workflow_stage ?? "allocated") as WorkflowStage,
    scanner: raw.scanner, editor: raw.editor, updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
    notes: raw.notes, dspaceHandle: raw.dspaceHandle ?? raw.dspace_handle
  };
}