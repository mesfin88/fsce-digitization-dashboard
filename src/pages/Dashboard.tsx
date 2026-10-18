import { useEffect, useState } from "react";
import { ArrowUpRight, Archive, ScanLine, FilePenLine, ClipboardCheck, ShieldCheck, Database, Clock3, CircleAlert, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { CaseRecord, DashboardSummary } from "../types";
import StatusBadge from "../components/StatusBadge";

const empty: DashboardSummary = { allocated:0, scanning:0, editing:0, qcPending:0, returned:0, approved:0, published:0, exceptions:0 };
export default function Dashboard() {
  const [summary, setSummary] = useState(empty);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { const [s,c] = await Promise.all([api.getSummary(), api.getCases()]); setSummary(s); setCases(c); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load dashboard"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const cards = [
    { label:"Awaiting scanning", value:summary.allocated, icon:Archive, tone:"slate", hint:"Physical file allocation" },
    { label:"Scanning in progress", value:summary.scanning, icon:ScanLine, tone:"blue", hint:"Operator work queues" },
    { label:"Editing queue", value:summary.editing, icon:FilePenLine, tone:"violet", hint:"PDF preparation" },
    { label:"QC pending", value:summary.qcPending, icon:ClipboardCheck, tone:"amber", hint:"Review required" },
    { label:"Approved for repository", value:summary.approved, icon:ShieldCheck, tone:"teal", hint:"QC-approved items" },
    { label:"Published in DSpace", value:summary.published, icon:Database, tone:"green", hint:"Publicly available items" }
  ];
  const stages = [
    ["Physical allocation", summary.allocated, "slate"],
    ["Scanning", summary.scanning, "blue"],
    ["Editing", summary.editing, "violet"],
    ["Quality control", summary.qcPending, "amber"],
    ["Approved / repository", summary.approved, "teal"],
    ["Published", summary.published, "green"]
  ] as const;
  const total = Math.max(1, stages.reduce((n,s) => n+s[1], 0));
  return <div className="page-stack">
    <div className="page-heading">
      <div><div className="eyebrow">OPERATIONS OVERVIEW</div><h1>Digitization dashboard</h1><p>Track physical files from archive allocation through scanning, editing, quality control and publication.</p></div>
      <button className="btn btn-secondary" onClick={() => void load()}><RefreshCw size={16}/> Refresh data</button>
    </div>
    {error && <div className="alert alert-error"><CircleAlert size={17}/><span>{error}. Check the API URL and backend status.</span></div>}
    <div className="data-notice"><span className="notice-dot"/><span>{import.meta.env.VITE_USE_DEMO_DATA === "false" ? "Connected API mode" : "Demo data mode"} — figures shown here are illustrative until connected to the backend.</span></div>
    <div className="metric-grid">{cards.map(card => { const Icon = card.icon; return <div className="metric-card" key={card.label}><div className="metric-top"><span>{card.label}</span><div className={`metric-icon ${card.tone}`}><Icon size={19}/></div></div><div className="metric-value">{loading ? "—" : card.value.toLocaleString()}</div><div className="metric-foot"><span>{card.hint}</span><ArrowUpRight size={15}/></div></div>; })}</div>
    <div className="content-grid">
      <section className="panel workflow-panel">
        <div className="panel-heading"><div><h2>Workflow pipeline</h2><p>Current workload by stage</p></div><span className="live-tag"><i/> CURRENT</span></div>
        <div className="pipeline">{stages.map(([label,value,tone]) => <div className="pipeline-row" key={label}><div className="pipeline-label"><span>{label}</span><b>{value}</b></div><div className="progress-track"><div className={`progress-fill ${tone}`} style={{width:`${Math.min(100, value/total*100)}%`}}/></div></div>)}</div>
        <div className="pipeline-foot"><span><Clock3 size={15}/> {summary.returned} returned for correction</span><span><CircleAlert size={15}/> {summary.exceptions} exceptions</span></div>
      </section>
      <section className="panel quick-panel">
        <div className="panel-heading"><div><h2>Quick actions</h2><p>Open a work queue</p></div></div>
        <div className="quick-actions">
          <Link to="/archive" className="quick-action"><div className="quick-icon slate"><Archive size={18}/></div><div><b>Allocate physical files</b><span>Register and assign case files</span></div><ArrowRight size={17}/></Link>
          <Link to="/scanning" className="quick-action"><div className="quick-icon blue"><ScanLine size={18}/></div><div><b>Scanning workbench</b><span>Track judge.pdf and other.pdf</span></div><ArrowRight size={17}/></Link>
          <Link to="/editing" className="quick-action"><div className="quick-icon violet"><FilePenLine size={18}/></div><div><b>Editing workbench</b><span>Prepare and submit files for QC</span></div><ArrowRight size={17}/></Link>
          <Link to="/quality-control" className="quick-action"><div className="quick-icon amber"><ClipboardCheck size={18}/></div><div><b>Quality control</b><span>Approve or return corrections</span></div><ArrowRight size={17}/></Link>
          <Link to="/repository" className="quick-action"><div className="quick-icon green"><Database size={18}/></div><div><b>DSpace submissions</b><span>Review repository status</span></div><ArrowRight size={17}/></Link>
        </div>
      </section>
    </div>
    <section className="panel table-panel">
      <div className="panel-heading"><div><h2>Recent case activity</h2><p>Latest updates across the workflow</p></div><Link className="text-link" to="/archive">View all cases <ArrowRight size={15}/></Link></div>
      <div className="table-wrap"><table><thead><tr><th>CASE NUMBER</th><th>CASE LEVEL / TYPE</th><th>JUDGE PDF</th><th>OTHER PDF</th><th>ASSIGNED TO</th><th>STATUS</th><th>UPDATED</th></tr></thead><tbody>
        {cases.slice(0,6).map(c => <tr key={c.id}><td><b className="case-number">{c.caseNo}</b></td><td><span>{c.caseLevel || "—"}</span><small>{c.caseType || "—"}</small></td><td>{c.judgePages ? `${c.judgePages} pages` : "—"}</td><td>{c.otherPages ? `${c.otherPages} pages` : "—"}</td><td>{c.editor || c.scanner || "Not assigned"}</td><td><StatusBadge stage={c.stage}/></td><td>{c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "—"}</td></tr>)}
        {!loading && cases.length === 0 && <tr><td colSpan={7} className="empty-cell">No cases found.</td></tr>}
      </tbody></table></div>
      <div className="table-bottom"><span>Showing {Math.min(cases.length,6)} of {cases.length} cases</span><Link className="text-link" to="/reports">Open reports <ArrowRight size={15}/></Link></div>
    </section>
  </div>;
}