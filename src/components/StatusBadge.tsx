import { STAGE_LABELS, type WorkflowStage } from "../types";
export default function StatusBadge({ stage }: { stage: WorkflowStage }) {
  const style = stage === "published" || stage === "qc_approved" ? "success"
    : stage === "returned_for_correction" || stage === "exception" ? "danger"
    : stage === "department_approval" || stage === "dspace_pending" ? "purple"
    : stage === "editing" || stage === "scanning" ? "blue" : "neutral";
  return <span className={`status-badge ${style}`}><i/>{STAGE_LABELS[stage]}</span>;
}