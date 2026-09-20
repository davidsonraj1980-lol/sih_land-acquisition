import { useMemo, useState } from "react";
import {
  LayoutDashboard, Map, FileText, Landmark, Gavel, Settings as SettingsIcon,
  Search, Bell, TrendingUp, TrendingDown, X,
  Download, ArrowUpRight, Clock3, AlertTriangle,
  CheckCircle2, CircleDot, MapPin, Scale, Users, Building2,
  ChevronRight, HardDrive, Check, Plus, RefreshCw, FileSpreadsheet,
  ShieldCheck, Home,
} from "lucide-react";
import type {
  Status, AuthorityCode, Project, NotificationRow,
  SiaReport, ValuationRecord, LitigationCase,
} from "./portalData";
import {
  authorities, projects, acquisitionStages, cadastralParcels, notifications,
  initialSiaReports, initialValuations, initialLitigations, initialCompensations,
  getUnifiedAcquisition,
} from "./portalData";
import LeafletCadastralMap, { statutoryCadastralParcels, type CadastralFeature } from "./LeafletCadastralMap";

/* ── State Emblem of India (Official Lion Capital of Ashoka - सत्यमेव जयते) ── */
function AshokaEmblem({ className = "h-16 w-auto" }: { className?: string }) {
  return (
    <img
      src="/emblem.svg"
      alt="State Emblem of India - सत्यमेव जयते"
      className={`${className} object-contain`}
      style={{ maxHeight: "70px" }}
    />
  );
}

/* ── UI Navigation & Types ── */
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, badge: null, badgeColor: "" },
  { label: "Spatial Map", icon: Map, badge: "GIS", badgeColor: "bg-amber-400/20 text-amber-300 border border-amber-400/40" },
  { label: "SIA Reports", icon: FileText, badge: "23", badgeColor: "bg-blue-400/30 text-blue-200 border border-blue-400/40" },
  { label: "Valuations", icon: Landmark, badge: "Sec 30", badgeColor: "bg-amber-400/20 text-amber-300 border border-amber-400/40" },
  { label: "Litigations", icon: Gavel, badge: "12 stays", badgeColor: "bg-amber-400/20 text-amber-300 border border-amber-400/40" },
  { label: "R&R Scheme", icon: Users, badge: "Sched II", badgeColor: "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40" },
  { label: "Settings", icon: SettingsIcon, badge: null, badgeColor: "" },
];

export interface KpiItem {
  label: string;
  value: string;
  unit: string;
  trend: string;
  up: boolean;
  subtitle: string;
}

/* ── helpers ── */
function StatusBadge({ status }: { status: Status | string }) {
  if (status === "Cleared" || status === "Approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        {status}
      </span>
    );
  }
  if (status === "Pending" || status === "Under review" || status === "Public hearing" || status === "Pending Review") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        <Clock3 className="h-3 w-3" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
      <AlertTriangle className="h-3 w-3" />
      {status}
    </span>
  );
}

function KpiCard({ item }: { item: KpiItem }) {
  const isNeutralOrWarning = item.trend.includes("Under") || item.trend.includes("Cleared");
  const isDown = item.trend.startsWith("-");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
            isNeutralOrWarning ? "text-amber-700" : isDown ? "text-amber-700" : "text-emerald-700"
          }`}
        >
          {item.trend.includes("Under") ? (
            <span className="font-mono text-[10px]">~</span>
          ) : isDown ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3" />
          )}
          {item.trend}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[24px] font-extrabold tracking-tight text-slate-900 font-mono">
          {item.value}
        </span>
        <span className="text-[12px] text-slate-500 font-medium">{item.unit}</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{item.subtitle}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT 1: AUTHORITY TABS (GOVERNMENT PORTAL BAR)
   ════════════════════════════════════════════════════════════════ */
function AuthorityTabBar({
  selectedAuthority,
  onSelectAuthority,
}: {
  selectedAuthority: AuthorityCode;
  onSelectAuthority: (auth: AuthorityCode) => void;
}) {
  const tabs: { code: AuthorityCode; label: string; count: number; tooltip: string }[] = [
    { code: "ALL", label: "All Statutory Projects", count: 11, tooltip: "National Land Acquisition Monitoring Portal (All India Overview)" },
    { code: "MIDC", label: "MIDC (Maharashtra)", count: 3, tooltip: "MIDC — Maharashtra Industrial Development Corporation" },
    { code: "GIDC", label: "GIDC (Gujarat)", count: 2, tooltip: "GIDC — Gujarat Industrial Development Corporation" },
    { code: "SIPCOT", label: "SIPCOT (Tamil Nadu)", count: 2, tooltip: "SIPCOT — State Industries Promotion Corporation of Tamil Nadu" },
    { code: "RIICO", label: "RIICO (Rajasthan)", count: 2, tooltip: "RIICO — Rajasthan State Industrial Development and Investment Corporation" },
    { code: "KIADB", label: "KIADB (Karnataka)", count: 2, tooltip: "KIADB — Karnataka Industrial Areas Development Board" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-1 px-1 pb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-blue-700" />
          <span>STATUTORY INDUSTRIAL DEVELOPMENT AUTHORITIES (RFCTLARR STATE NODAL BOARDS)</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          ACT SECTION 3(E) NODAL AGENCIES
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isSelected = selectedAuthority === tab.code;
          return (
            <button
              key={tab.code}
              onClick={() => onSelectAuthority(tab.code)}
              title={tab.tooltip}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#0b2545] text-white shadow-xs font-semibold ring-1 ring-[#0b2545]"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSelected ? "bg-amber-400 ring-2 ring-amber-300/40" : "bg-slate-400"
                }`}
              />
              <span>{tab.label}</span>
              <span
                className={`ml-1 rounded px-1.5 py-0.5 text-[11px] font-mono ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 border border-slate-200/60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT 2: AUTHORITY-SPECIFIC DASHBOARD HEADER
   ════════════════════════════════════════════════════════════════ */
function AuthorityDashboardHeader({
  authorityCode,
  onToast,
}: {
  authorityCode: AuthorityCode;
  onToast: (msg: string) => void;
}) {
  const auth = authorities[authorityCode];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-14 shrink-0 place-items-center rounded-lg bg-[#0b2545] font-bold text-white shadow-xs">
            <span className="font-mono text-[13px] tracking-tight">{auth.logoShort}</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                {auth.name !== auth.fullName ? `${auth.name} — ${auth.fullName}` : auth.fullName}
              </h2>
              <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 font-medium text-[11px] text-blue-700">
                State: {auth.state}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-slate-600 max-w-3xl leading-relaxed">
              {auth.description}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                🏛 Headquarters: <strong className="text-slate-700 font-medium">{auth.headquarters}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                👤 Nodal SLAO: <strong className="text-slate-700 font-medium">{auth.nodalOfficer}</strong> ({auth.designation})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => onToast(`Exported Authority Dossier for ${auth.name}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            Download Authority Dossier (PDF)
          </button>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT 3: PROJECT CARD
   ════════════════════════════════════════════════════════════════ */
function ProjectCard({
  project,
  onViewProject,
}: {
  project: Project;
  onViewProject: (proj: Project) => void;
}) {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "Active":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Fast-Track":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Near Completion":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-md hover:border-slate-300">
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-[#1a2744] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              {project.authority}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {project.state} • {project.district}
            </span>
          </div>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        {/* Project Title */}
        <h3 className="mt-2.5 text-[15px] font-bold text-slate-900 line-clamp-1">
          {project.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
          {project.description}
        </p>

        {/* Metric Summary */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px]">
          <div>
            <span className="text-slate-400">Land Required:</span>
            <p className="font-mono font-bold text-slate-800">
              {project.totalAreaHa.toLocaleString()} Ha{" "}
              <span className="font-normal text-[10px] text-slate-500">
                ({Math.round((project.acquiredAreaHa / project.totalAreaHa) * 100)}% acq)
              </span>
            </p>
          </div>
          <div>
            <span className="text-slate-400">Cadastral Parcels:</span>
            <p className="font-mono font-bold text-slate-800">
              {project.totalParcels} plots
            </p>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-400">Acquisition ID Range:</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
              {project.acquisitionIdRange}
            </span>
          </div>
        </div>

        {/* Stage & Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-700">Stage: {project.currentStage}</span>
            <span className="font-mono font-bold text-slate-900">{project.progressPct}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${project.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="font-mono text-[10px] text-slate-400">
          DEMO / PROTOTYPE DATA
        </span>
        <button
          onClick={() => onViewProject(project)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 shadow-xs transition"
        >
          <span>View Project</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT 4: PROJECT DETAILS VIEW & 7-STAGE PROGRESS PANEL
   ════════════════════════════════════════════════════════════════ */
function ProjectDetailsView({
  project,
  onBack,
  onViewAcquisition,
  onNavigate,
  onToast,
}: {
  project: Project;
  onBack: () => void;
  onViewAcquisition: (acqId: string) => void;
  onNavigate: (tab: string) => void;
  onToast: (msg: string) => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<
    "parcels" | "map" | "sia" | "valuation" | "compensation" | "litigation" | "docs"
  >("parcels");

  const projectParcels = useMemo(
    () => cadastralParcels.filter((p) => p.project === project.name || p.authority === project.authority),
    [project]
  );
  const projectSias = useMemo(
    () => initialSiaReports.filter((s) => s.project === project.name || s.authority === project.authority),
    [project]
  );
  const projectValuations = useMemo(
    () => initialValuations.filter((v) => v.project === project.name || v.authority === project.authority),
    [project]
  );
  const projectLitigations = useMemo(
    () => initialLitigations.filter((l) => l.project === project.name || l.authority === project.authority),
    [project]
  );
  const projectCompensations = useMemo(
    () => Object.values(initialCompensations).filter((c) => c.project === project.name || c.authority === project.authority),
    [project]
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 transition"
          >
            ← Back to All Projects
          </button>
          <span>/</span>
          <span className="font-medium text-slate-700">{project.authority}</span>
          <span>/</span>
          <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">{project.name}</span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="rounded bg-blue-50 border border-blue-200 px-2.5 py-0.5 font-mono text-[11px] font-bold text-blue-700">
            {project.acquisitionIdRange}
          </span>
          <button
            onClick={() => onToast(`Exported Gazette Acquisition Dossier for ${project.name}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Download className="h-3.5 w-3.5" />
            Gazette Dossier PDF
          </button>
        </div>
      </div>

      {/* Institutional Project Overview Box */}
      <section className="rounded-xl border border-slate-200 bg-linear-to-br from-white via-slate-50/70 to-blue-50/20 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded bg-[#1a2744] px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
                {project.authority}
              </span>
              <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                {project.name}
              </h1>
              <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                {project.status}
              </span>
            </div>
            <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
              {project.description}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono">
              <span>Jurisdiction: <strong>{project.state}, {project.district}</strong></span>
              <span>Gazette Ref: <strong className="text-slate-700">{project.gazetteNotificationRef}</strong></span>
              <span>Nodal Officer: <strong>{project.nodalOfficer}</strong></span>
              <span>Target: <strong>{project.targetCompletion}</strong></span>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-5 shrink-0">
            <div className="text-left lg:text-right">
              <span className="text-[11px] text-slate-400">Total Acquisition Progress</span>
              <p className="font-mono text-[22px] font-bold text-blue-700">{project.progressPct}%</p>
            </div>
            <div className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-medium text-blue-800">
              Current Stage: <strong>{project.currentStage}</strong>
            </div>
          </div>
        </div>

        {/* Project Key Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-200/80 pt-4">
          <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
            <p className="text-[11px] text-slate-400">Total Land Required</p>
            <p className="font-mono text-[16px] font-bold text-slate-800">{project.totalAreaHa.toLocaleString()} Ha</p>
            <p className="text-[10px] text-green-700">{project.acquiredAreaHa.toLocaleString()} Ha Acquired</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
            <p className="text-[11px] text-slate-400">Cadastral Parcels</p>
            <p className="font-mono text-[16px] font-bold text-slate-800">{project.totalParcels} plots</p>
            <p className="text-[10px] text-blue-600 font-mono">Range: {project.acquisitionIdRange}</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
            <p className="text-[11px] text-slate-400">Est. Compensation Pool</p>
            <p className="font-mono text-[16px] font-bold text-slate-800">₹{project.estimatedCompensationCr} Cr</p>
            <p className="text-[10px] text-emerald-600 font-mono">₹{project.disbursedCompensationCr} Cr Disbursed</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-2xs">
            <p className="text-[11px] text-slate-400">Sector / Cluster</p>
            <p className="text-[13px] font-bold text-slate-800 truncate">{project.sector}</p>
            <p className="text-[10px] text-slate-500">Statutory Acquisition</p>
          </div>
        </div>
      </section>

      {/* ── 7-Stage Acquisition Progress Stepper ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-700" />
              Statutory 7-Stage Acquisition Lifecycle (RFCTLARR Act 2013)
            </h2>
            <p className="text-[11px] text-slate-500">
              Real-time milestone tracking for {project.name}
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Active: Step {project.currentStageIndex + 1} of 7
          </span>
        </div>

        {/* Stepper Bar */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-7 min-w-[700px] gap-2">
            {acquisitionStages.map((stg, idx) => {
              const isCompleted = idx < project.currentStageIndex;
              const isCurrent = idx === project.currentStageIndex;

              return (
                <div
                  key={stg.stage}
                  className={`flex flex-col justify-between rounded-lg p-3 border transition-all ${
                    isCurrent
                      ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-100 shadow-xs"
                      : isCompleted
                      ? "bg-green-50/60 border-green-200"
                      : "bg-slate-50/50 border-slate-200 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] font-bold ${
                          isCompleted
                            ? "bg-green-600 text-white"
                            : isCurrent
                            ? "bg-[#1a2744] text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                      </span>
                      <span className="font-mono text-[9px] font-bold text-slate-500">
                        {stg.refAct}
                      </span>
                    </div>
                    <p className={`mt-2 text-[11px] font-bold ${isCurrent ? "text-blue-900" : isCompleted ? "text-green-900" : "text-slate-600"}`}>
                      {stg.stage}
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-500 leading-tight line-clamp-2">
                      {stg.shortDesc}
                    </p>
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-200/60">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? "text-green-700"
                          : isCurrent
                          ? "text-blue-700 animate-pulse"
                          : "text-slate-400"
                      }`}
                    >
                      {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Project Sub-Module Tabs Bar ── */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: "parcels", label: "Land Parcels", count: projectParcels.length, icon: Landmark },
            { key: "map", label: "GIS Map", count: null, icon: Map },
            { key: "sia", label: "SIA Reports", count: projectSias.length, icon: FileText },
            { key: "valuation", label: "Valuation Awards", count: projectValuations.length, icon: Building2 },
            { key: "compensation", label: "Compensation (DBT)", count: projectCompensations.length, icon: HardDrive },
            { key: "litigation", label: "Litigation & Stays", count: projectLitigations.length, icon: Gavel },
            { key: "docs", label: "Documents & Gazettes", count: 4, icon: FileSpreadsheet },
          ].map((tab) => {
            const isSelected = activeSubTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key as any)}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-[12px] font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? "border-blue-700 text-blue-700 bg-blue-50/40 rounded-t-md"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                      isSelected
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sub-Tab Contents ── */}
      <div className="rounded-b-xl border-x border-b border-slate-200 bg-white p-4 sm:p-5 shadow-xs -mt-5">
        {/* TAB 1: LAND PARCELS */}
        {activeSubTab === "parcels" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Demarcated Land Parcels under {project.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Click any parcel or &quot;View Acquisition&quot; to inspect full connected dossier across SIA, Valuation, Compensation, and Litigation.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Showing {projectParcels.length} parcels
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[800px] text-[12px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[11px] font-semibold text-slate-500">
                    <th className="px-4 py-2.5">Acquisition ID</th>
                    <th className="px-4 py-2.5">Gat / Survey</th>
                    <th className="px-4 py-2.5">ULPIN</th>
                    <th className="px-4 py-2.5">Khatadar (Owner)</th>
                    <th className="px-4 py-2.5">Area Acquired</th>
                    <th className="px-4 py-2.5">Classification</th>
                    <th className="px-4 py-2.5">Circle Rate</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projectParcels.map((p, idx) => (
                    <tr
                      key={p.id}
                      onClick={() => onViewAcquisition(p.acquisitionId)}
                      className={`cursor-pointer border-t border-slate-100 hover:bg-blue-50/40 ${
                        idx % 2 === 1 ? "bg-slate-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[11px]">
                          {p.acquisitionId}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.gatNo}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{p.ulpin}</td>
                      <td className="px-4 py-3 text-slate-700">{p.owner}</td>
                      <td className="px-4 py-3 font-mono text-slate-800">
                        {p.areaAcquiredHa} Ha{" "}
                        <span className="text-[10px] text-slate-400">/ {p.areaTotalHa} Ha</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.classification}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">₹{p.circleRate.toLocaleString()}/m²</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewAcquisition(p.acquisitionId);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-[#2563eb] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 shadow-2xs transition"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          View Acquisition
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: GIS MAP */}
        {activeSubTab === "map" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Spatial GIS Cadastral Map for {project.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Interactive satellite overlay with demarcated boundary polygons
                </p>
              </div>
              <button
                onClick={() => onNavigate("Spatial Map")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#243352] transition"
              >
                <Map className="h-3.5 w-3.5" />
                Open in Full Spatial Map
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-4 text-white overflow-hidden min-h-[300px] flex flex-col justify-between">
              <svg className="w-full h-64" viewBox="0 0 650 300">
                <rect width="650" height="300" fill="#0f172a" />
                <path d="M 0,150 Q 200,80 400,160 T 650,140" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6,4" />
                {projectParcels.map((p) => (
                  <g key={p.id} onClick={() => onViewAcquisition(p.acquisitionId)} className="cursor-pointer group">
                    <polygon
                      points={p.polyPoints.split(" ").map(pt => {
                        const [x, y] = pt.split(",").map(Number);
                        return `${(x % 550) + 40},${(y % 200) + 40}`;
                      }).join(" ")}
                      fill={p.status === "Cleared" ? "rgba(34, 197, 94, 0.4)" : p.status === "Pending" ? "rgba(234, 179, 8, 0.4)" : "rgba(239, 68, 68, 0.4)"}
                      stroke={p.status === "Cleared" ? "#22c55e" : p.status === "Pending" ? "#eab308" : "#ef4444"}
                      strokeWidth="2"
                    />
                    <text
                      x={((p.center[0] % 500) + 40)}
                      y={((p.center[1] % 180) + 60)}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {p.acquisitionId}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg">
                <span>Click any parcel polygon to view unified dossier.</span>
                <span className="font-mono">Spatial CRS: EPSG:3857 (WGS84 Web Mercator)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIA REPORTS */}
        {activeSubTab === "sia" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Social Impact Assessment (SIA) Clearances
                </h3>
                <p className="text-[11px] text-slate-500">
                  Statutory studies conducted under Section 4 of RFCTLARR Act 2013
                </p>
              </div>
              <button
                onClick={() => onNavigate("SIA Reports")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <FileText className="h-3.5 w-3.5" />
                View Full SIA Module
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectSias.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {s.acquisitionId} • {s.id}
                      </span>
                      <h4 className="mt-1.5 text-[13px] font-bold text-slate-900">{s.agency}</h4>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                    &ldquo;{s.summary}&rdquo;
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400">Hearing:</span>
                      <p className="font-bold text-slate-800">{s.hearingDate}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400">Families:</span>
                      <p className="font-bold text-slate-800">{s.families}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400">SC/ST:</span>
                      <p className="font-bold text-slate-800">{s.scStFamilies}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewAcquisition(s.acquisitionId)}
                    className="w-full rounded-lg bg-white border border-slate-200 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 transition flex items-center justify-center gap-1"
                  >
                    View Connected Acquisition ({s.acquisitionId})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VALUATION */}
        {activeSubTab === "valuation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Statutory Land Valuation & Award Schedules
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ready Reckoner Base + Rural Multiplier + 100% Solatium (Sec 26 & 30)
                </p>
              </div>
              <button
                onClick={() => onNavigate("Valuations")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Landmark className="h-3.5 w-3.5" />
                View Full Valuations Module
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[700px] text-[12px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-[11px] font-semibold text-slate-500">
                    <th className="px-4 py-2.5">Acquisition ID</th>
                    <th className="px-4 py-2.5">Parcel Ref</th>
                    <th className="px-4 py-2.5">Area</th>
                    <th className="px-4 py-2.5">Circle Rate</th>
                    <th className="px-4 py-2.5">Multiplier</th>
                    <th className="px-4 py-2.5">Solatium</th>
                    <th className="px-4 py-2.5">Total Award</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectValuations.map((v) => (
                    <tr key={v.id} onClick={() => onViewAcquisition(v.acquisitionId)} className="cursor-pointer border-t border-slate-100 hover:bg-blue-50/30">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{v.acquisitionId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{v.parcel}</td>
                      <td className="px-4 py-3 font-mono">{(v.areaSqM / 10000).toFixed(2)} Ha</td>
                      <td className="px-4 py-3 font-mono">₹{v.circleRate.toLocaleString()}/m²</td>
                      <td className="px-4 py-3 font-mono">{v.multiplier}x</td>
                      <td className="px-4 py-3 font-mono text-green-700">+{v.solatiumPct}%</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">₹{v.totalCr} Cr</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COMPENSATION */}
        {activeSubTab === "compensation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  PFMS Direct Benefit Transfer (DBT) & Escrow Status
                </h3>
                <p className="text-[11px] text-slate-500">
                  Aadhaar-seeded electronic disbursement and statutory revenue escrows
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectCompensations.map((c) => (
                <div key={c.acquisitionId} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {c.acquisitionId}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-slate-500">Disbursement Mode:</span>
                    <span className="font-medium text-[12px] text-slate-800">{c.mode}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-slate-500">Disbursed / Award:</span>
                    <span className="font-mono font-bold text-[13px] text-slate-900">
                      ₹{c.disbursedCr} Cr <span className="text-[11px] font-normal text-slate-400">/ ₹{c.totalCr} Cr</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono text-[11px]">
                    <span className="text-slate-400">DBT Reference:</span>
                    <span className="font-bold text-blue-700">{c.dbtRef || "N/A"}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200">
                    {c.notes}
                  </p>
                  <button
                    onClick={() => onViewAcquisition(c.acquisitionId)}
                    className="w-full rounded-lg bg-white border border-slate-200 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 transition"
                  >
                    View Unified Acquisition Record
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LITIGATION */}
        {activeSubTab === "litigation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Judicial & High Court Contested Acquisitions
                </h3>
                <p className="text-[11px] text-slate-500">
                  Section 64 Land Acquisition Authority references & writ petitions
                </p>
              </div>
              <button
                onClick={() => onNavigate("Litigations")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Gavel className="h-3.5 w-3.5" />
                View Full Litigations Module
              </button>
            </div>

            {projectLitigations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No Active Litigations</p>
                <p className="text-[12px]">All acquisitions for this project proceed without judicial stays.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectLitigations.map((l) => (
                  <div key={l.caseNo} className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
                          {l.caseNo}
                        </span>
                        <span className="font-semibold text-slate-900 text-[13px]">{l.court}</span>
                        <span className="font-mono text-[11px] font-bold text-blue-700">({l.acquisitionId})</span>
                      </div>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                        {l.status}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-700">
                      <p><strong>Petitioner:</strong> {l.petitioner}</p>
                      <p className="mt-0.5 text-slate-600"><strong>Relief Claimed:</strong> {l.reliefClaimed}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-red-100 text-[11px]">
                      <span className="text-slate-500">Next Hearing: <strong>{l.nextDate}</strong> ({l.daysRemaining} days left)</span>
                      <button
                        onClick={() => onViewAcquisition(l.acquisitionId)}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        Inspect Dossier ({l.acquisitionId}) →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DOCUMENTS */}
        {activeSubTab === "docs" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">
                Official Gazetted Documents & Cadastral Extracts
              </h3>
              <p className="text-[11px] text-slate-500">
                Statutory forms and digital signatures generated under National Land Acquisition Guidelines
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: `Section 4 Preliminary Gazette Notification — ${project.name}`, file: "Gazette_Sec4_Notification.pdf", size: "1.4 MB", type: "Statutory Order" },
                { title: `Section 19 Declaration of Public Purpose & SIMP Approval`, file: "Gazette_Sec19_Declaration.pdf", size: "2.1 MB", type: "Gazette Notification" },
                { title: `Consolidated Form 7/12 & 8A Land Title Extracts`, file: "Cadastral_Land_Records_Extract.pdf", size: "4.8 MB", type: "Revenue Records" },
                { title: `Joint Measurement Survey (JMS) & Boundary Maps`, file: "JMS_Survey_Sheet_Map.pdf", size: "8.2 MB", type: "GIS Spatial Sheet" },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                      PDF
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800 line-clamp-1">{doc.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{doc.file} • {doc.size} • {doc.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToast(`Downloaded ${doc.file} to local documents folder.`)}
                    className="rounded-lg bg-white border border-slate-200 p-2 text-slate-600 hover:text-blue-700 hover:border-blue-300 shadow-2xs transition"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   UNIFIED ACQUISITION DETAILS VIEW / PANEL
   Connects: Parcel → SIA → Valuation → Compensation → Litigation
   ════════════════════════════════════════════════════════════════ */
function AcquisitionDetailsModal({
  acquisitionId,
  onClose,
  onNavigate,
  onToast,
}: {
  acquisitionId: string;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onToast: (msg: string) => void;
}) {
  const data = getUnifiedAcquisition(acquisitionId);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl my-6 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1a2744] text-white px-5 sm:px-6 py-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/20 border border-blue-400/40 px-2.5 py-0.5 font-mono text-[12px] font-bold text-blue-300">
                {data.acquisitionId}
              </span>
              <StatusBadge status={data.status} />
              <span className="text-[11px] text-slate-300">
                • Unified Acquisition Dossier
              </span>
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
              {data.project}
            </h2>
            <p className="text-[12px] text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              {data.parcel
                ? `${data.parcel.village}, Taluka ${data.parcel.taluka}, ${data.parcel.district} District`
                : "Maharashtra National Acquisition Zone"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Land Parcel Information */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
              <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                <Map className="h-4 w-4 text-blue-600" />
                Land Parcel Information
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onNavigate("Spatial Map");
                  onToast(`Focused ${data.gatNo} (${data.acquisitionId}) on GIS Spatial Map`);
                }}
                className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
              >
                View on Spatial Map <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[12px]">
              <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-medium">Acquisition ID</span>
                <span className="font-mono font-bold text-blue-700 text-[13px]">{data.acquisitionId}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-medium">Gat / Survey Number</span>
                <span className="font-bold text-slate-800 text-[13px]">{data.gatNo}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-medium">ULPIN (14 Digits)</span>
                <span className="font-mono font-semibold text-slate-700">{data.ulpin}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs sm:col-span-2">
                <span className="text-[10px] text-slate-400 block font-medium">Khatadar (Title Owner)</span>
                <span className="font-semibold text-slate-800 truncate block">{data.owner}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 block font-medium">Area Required</span>
                <span className="font-mono font-bold text-slate-800">
                  {data.areaAcquiredHa} Ha <span className="text-[10px] text-slate-400 font-normal">/ {data.areaTotalHa} Ha</span>
                </span>
              </div>
              {data.parcel && (
                <>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Classification</span>
                    <span className="font-medium text-slate-700">{data.parcel.classification}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Circle Rate (2024-25)</span>
                    <span className="font-mono font-semibold text-slate-800">₹{data.parcel.circleRate.toLocaleString("en-IN")}/sq.m</span>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Current Status</span>
                    <StatusBadge status={data.status} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Connected Modules Pipeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Cross-Module Acquisition Pipeline ({data.acquisitionId})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                1 Parcel → 1 Acquisition ID → All Records
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. SIA Status Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-[13px] font-bold text-slate-800">1. SIA Appraisal</span>
                    </div>
                    <StatusBadge status={data.sia?.status || "Approved"} />
                  </div>

                  {data.sia ? (
                    <div className="mt-3 space-y-1.5 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">SIA Reference:</span>
                        <span className="font-mono font-semibold text-blue-700">{data.sia.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assessing Body:</span>
                        <span className="font-medium text-slate-700 text-right max-w-[170px] truncate" title={data.sia.agency}>
                          {data.sia.agency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Affected Families:</span>
                        <span className="font-bold text-slate-800">{data.sia.families} PAF ({data.sia.scStFamilies} SC/ST)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Public Hearing:</span>
                        <span className="font-medium text-slate-700">{data.sia.hearingDate}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                        {data.sia.summary}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-[12px] text-slate-400 py-3 text-center">
                      Corridor SIA study approved under main section alignment.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate("SIA Reports");
                    onToast(`Opened SIA Study dossier for ${data.acquisitionId}`);
                  }}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View in SIA Module <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

              {/* 2. Valuation Status Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-purple-600" />
                      <span className="text-[13px] font-bold text-slate-800">2. Valuation & Award</span>
                    </div>
                    <StatusBadge status={data.valuation?.status || (data.status === "Cleared" ? "Approved" : data.status)} />
                  </div>

                  {data.valuation ? (
                    <div className="mt-3 space-y-1.5 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valuation Record:</span>
                        <span className="font-mono font-semibold text-purple-700">{data.valuation.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Circle Rate & Factor:</span>
                        <span className="font-mono text-slate-700">₹{data.valuation.circleRate.toLocaleString("en-IN")}/sq.m • {data.valuation.multiplier}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Attached Assets:</span>
                        <span className="font-mono text-slate-700">₹{(data.valuation.assetsValue / 100000).toFixed(1)} Lakh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mandatory Solatium:</span>
                        <span className="font-mono font-semibold text-amber-700">100% (Sec 30)</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-700">Total Statutory Award:</span>
                        <span className="font-mono font-bold text-[14px] text-green-700">₹{data.valuation.totalCr} Cr</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2 text-[12px]">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-400">Estimated Award:</span>
                        <span className="font-mono font-bold text-[14px] text-green-700">₹{data.compensation.totalCr} Cr</span>
                      </div>
                      <p className="text-[11px] text-slate-400 py-1.5">Preliminary estimate under Ready Reckoner guidelines.</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate("Valuations");
                    onToast(`Opened Section 30 Valuation worksheet for ${data.acquisitionId}`);
                  }}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View in Valuations <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

              {/* 3. Compensation Status Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-green-600" />
                      <span className="text-[13px] font-bold text-slate-800">3. Compensation & DBT</span>
                    </div>
                    <StatusBadge status={data.compensation.status} />
                  </div>

                  <div className="mt-3 space-y-1.5 text-[12px]">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">Statutory Award:</span>
                      <span className="font-mono font-bold text-slate-800">₹{data.compensation.totalCr} Crore</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-400">Disbursed Amount:</span>
                      <span className={`font-mono font-bold ${data.compensation.disbursedCr > 0 ? "text-green-700" : "text-amber-700"}`}>
                        ₹{data.compensation.disbursedCr} Cr {data.compensation.totalCr > 0 && `(${((data.compensation.disbursedCr / data.compensation.totalCr) * 100).toFixed(0)}%)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disbursement Mode:</span>
                      <span className="font-medium text-slate-700 text-right truncate max-w-[170px]" title={data.compensation.mode}>
                        {data.compensation.mode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PFMS / Escrow Ref:</span>
                      <span className="font-mono font-semibold text-slate-700">{data.compensation.dbtRef}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                      {data.compensation.notes}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onToast(`Generated Treasury Payment Advice for ${data.acquisitionId}`);
                  }}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Download className="h-3 w-3" />
                  Download Treasury Advice
                </button>
              </div>

              {/* 4. Litigation Status Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Gavel className="h-4 w-4 text-amber-600" />
                      <span className="text-[13px] font-bold text-slate-800">4. Litigation & Legal</span>
                    </div>
                    {data.litigation ? (
                      <StatusBadge status={data.litigation.status} />
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        No Active Litigations
                      </span>
                    )}
                  </div>

                  {data.litigation ? (
                    <div className="mt-3 space-y-1.5 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Case Number:</span>
                        <span className="font-mono font-bold text-blue-700">{data.litigation.caseNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Court / Forum:</span>
                        <span className="font-semibold text-slate-800">{data.litigation.court}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dispute Type:</span>
                        <span className="font-medium text-slate-700">{data.litigation.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Next Hearing:</span>
                        <span className="font-bold text-red-600">{data.litigation.nextDate} (in {data.litigation.daysRemaining} days)</span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-600 bg-red-50/50 p-2 rounded border border-red-100">
                        {data.litigation.reliefClaimed}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 py-4 text-center space-y-1 text-[12px] text-slate-400">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      <p className="font-medium text-slate-600">Title clear and uncontested</p>
                      <p className="text-[10.5px] text-slate-400">No High Court writ petitions or Section 64 objections filed.</p>
                    </div>
                  )}
                </div>

                {data.litigation ? (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate("Litigations");
                      onToast(`Opened court case file ${data.litigation?.caseNo}`);
                    }}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View in Litigations <ArrowUpRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate("Litigations");
                      onToast(`Opening Litigation Logger for ${data.acquisitionId}`);
                    }}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 transition"
                  >
                    <Plus className="h-3 w-3" />
                    Log Dispute If Notice Served
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <CircleDot className="h-3.5 w-3.5 text-blue-600" />
            <span>Single Source of Truth: <strong>{data.acquisitionId}</strong> • {data.gatNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToast(`Exported full Acquisition Dossier (${data.acquisitionId}) as PDF`)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-100 shadow-2xs transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export Dossier PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-[#1a2744] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#243352] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE 1: SPATIAL MAP (Interactive GIS & Cadastral Parcels)
   ════════════════════════════════════════════════════════════════ */
function SpatialMapPage({
  onToast,
  onViewAcquisition,
}: {
  onToast: (msg: string) => void;
  onViewAcquisition: (acqId: string) => void;
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<"Pune" | "Bengaluru">("Pune");
  const [activeLayer, setActiveLayer] = useState<"cadastral" | "satellite" | "alignment">("cadastral");
  const [selectedCadastral, setSelectedCadastral] = useState<CadastralFeature>(statutoryCadastralParcels[0]);
  const [show712Modal, setShow712Modal] = useState(false);

  const selectedAuthority: AuthorityCode = selectedDistrict === "Bengaluru" ? "KIADB" : "MIDC";

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            Cadastral Spatial GIS & Land Record Engine
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Interactive Survey/Gat parcel geometry with 90m Right-of-Way (ROW) corridor and RoR 7/12 integration
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer switch */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[12px] shadow-sm">
            <button
              onClick={() => setActiveLayer("cadastral")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                activeLayer === "cadastral" ? "bg-[#0b2545] text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cadastral (Gat)
            </button>
            <button
              onClick={() => setActiveLayer("satellite")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                activeLayer === "satellite" ? "bg-[#0b2545] text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Satellite Imagery
            </button>
            <button
              onClick={() => setActiveLayer("alignment")}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                activeLayer === "alignment" ? "bg-[#0b2545] text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ROW Corridor
            </button>
          </div>

          <button
            onClick={() => onToast("Synchronized cadastral boundaries from National Remote Sensing Centre (NRSC / ISRO Bhuvan)")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Bhuvan / MRSAC
          </button>
        </div>
      </div>

      {/* Main Map + Inspector layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Map Canvas (Leaflet) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col h-full">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between bg-[#0b2545] px-4 py-2.5 text-white">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span className="text-[13px] font-semibold">
                {selectedDistrict === "Pune" ? "Pune (Haveli Taluka — Wadgaon Sheri Corridor)" : "Bengaluru Rural (Devanahalli — Aerospace SEZ)"}
              </span>
              <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                EPSG:32643
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300">Corridor Sector:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const dist = e.target.value as "Pune" | "Bengaluru";
                  setSelectedDistrict(dist);
                  const first = statutoryCadastralParcels.find((p) =>
                    dist === "Bengaluru" ? p.authority === "KIADB" : p.authority === "MIDC"
                  );
                  if (first) setSelectedCadastral(first);
                }}
                className="rounded bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white outline-none"
              >
                <option value="Pune" className="text-slate-900">MIDC Pune (Chakan Link)</option>
                <option value="Bengaluru" className="text-slate-900">KIADB Bengaluru (Devanahalli SEZ)</option>
              </select>
            </div>
          </div>

          {/* Real Leaflet Map */}
          <div className="p-3 bg-slate-50 flex-1">
            <LeafletCadastralMap
              selectedParcel={selectedCadastral}
              onSelectParcel={(p) => setSelectedCadastral(p)}
              activeLayer={activeLayer}
              onLayerChange={(layer) => setActiveLayer(layer)}
              selectedAuthority={selectedAuthority}
            />
          </div>
        </div>

        {/* Parcel Inspector Panel */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-slate-900">
                    {selectedCadastral.gatNo}
                  </h3>
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 font-mono text-[11px] font-bold text-blue-700">
                    {selectedCadastral.acquisitionId}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Cadastral Land Dossier • RFCTLARR 2013
                </p>
              </div>
              <StatusBadge status={selectedCadastral.status} />
            </div>

            <div className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between rounded-lg bg-blue-50/50 border border-blue-100 p-2">
                <span className="font-medium text-blue-950">ULPIN (14-Digit Bhu-Aadhaar)</span>
                <span className="font-mono font-bold text-blue-800">{selectedCadastral.ulpin}</span>
              </div>
              <div className="flex justify-between p-1 border-b border-slate-50">
                <span className="text-slate-500">Khatadar (Title Owner)</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[190px]">{selectedCadastral.owner}</span>
              </div>
              <div className="flex justify-between p-1 border-b border-slate-50">
                <span className="text-slate-500">Village & Taluka</span>
                <span className="text-slate-700 font-medium">{selectedCadastral.village}, {selectedCadastral.taluka}</span>
              </div>
              <div className="flex justify-between p-1 border-b border-slate-50">
                <span className="text-slate-500">Land Classification</span>
                <span className="font-medium text-slate-800">{selectedCadastral.landClass}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-2">
                <span className="text-slate-600 font-medium">Acquisition Area</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedCadastral.areaHa} Ha <span className="text-slate-500 font-normal">({selectedCadastral.areaGuntha} Guntha)</span>
                </span>
              </div>
              <div className="flex justify-between p-1 border-b border-slate-50">
                <span className="text-slate-500">Circle Rate (Ready Reckoner)</span>
                <span className="font-semibold text-slate-800 font-mono">₹{selectedCadastral.circleRatePerSqM.toLocaleString("en-IN")}/sq.m</span>
              </div>
              <div className="flex justify-between p-1 border-b border-slate-50">
                <span className="text-slate-500">Market Value (Sec 26)</span>
                <span className="font-semibold text-slate-800 font-mono">₹{selectedCadastral.marketValueCr} Cr</span>
              </div>
              <div className="flex justify-between p-1 border-b border-slate-50">
                <span className="text-slate-500">100% Solatium (Sec 30)</span>
                <span className="font-semibold text-amber-700 font-mono">+₹{selectedCadastral.solatiumCr} Cr</span>
              </div>
              <div className="flex justify-between rounded-lg bg-green-50 border border-green-200 p-2.5">
                <span className="font-bold text-green-950">Statutory Award (Sec 31)</span>
                <span className="font-mono font-black text-[14px] text-green-800">₹{selectedCadastral.totalAwardCr} Cr</span>
              </div>

              {selectedCadastral.disputeNote && (
                <div className="rounded-lg border border-red-200 bg-red-50/60 p-2.5 text-[11px] text-red-900 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{selectedCadastral.disputeNote}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => onViewAcquisition(selectedCadastral.acquisitionId)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563eb] py-2 text-[12px] font-bold text-white hover:bg-blue-700 shadow-xs transition"
            >
              <ArrowUpRight className="h-4 w-4" />
              View Statutory Acquisition ({selectedCadastral.acquisitionId})
            </button>
            <button
              onClick={() => setShow712Modal(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0b2545] py-2 text-[12px] font-semibold text-white hover:bg-[#12335c] transition"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-amber-300" />
              View 7/12 (Saat-Baara) Extract
            </button>
            <button
              onClick={() => onToast(`Joint Measurement Survey (JMS) notice dispatched for ${selectedCadastral.gatNo} to Revenue Inspector & Talathi.`)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Check className="h-3.5 w-3.5 text-slate-600" />
              Request Joint Measurement Survey
            </button>
          </div>
        </div>
      </div>

      {/* 7/12 Extract Modal conforming to Mahabhulekh / Bhoomi */}
      {show712Modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShow712Modal(false)}>
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-900 uppercase">
                  Statutory Revenue Record (RoR)
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-1">
                  गाव नमुना ७/१२ (Form VII & XII Extract)
                </h3>
                <p className="text-[12px] text-slate-500">
                  Government of Maharashtra / Land Records Authority • Village: {selectedCadastral.village}, Taluka: {selectedCadastral.taluka}, District: {selectedCadastral.district}
                </p>
              </div>
              <button onClick={() => setShow712Modal(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-[12px]">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Gat / Survey Number</span>
                  <span className="font-bold text-slate-900">{selectedCadastral.gatNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">14-Digit ULPIN (Bhu-Aadhaar)</span>
                  <span className="font-bold text-blue-700">{selectedCadastral.ulpin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Area</span>
                  <span className="font-semibold">{selectedCadastral.areaHa} Hectare ({selectedCadastral.areaGuntha} Guntha)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Land Tenure Class</span>
                  <span className="font-semibold text-slate-800">Class-1 Occupant (Bhogwatdar-1)</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <p className="text-[11px] font-bold text-slate-800 mb-1">Kabjedar (Registered Title Holder):</p>
                <p className="text-slate-900 font-semibold">{selectedCadastral.owner}</p>
                <p className="text-[10px] text-slate-500 mt-1">Khata No: 4092 | Mutation (Ferfar) Entry No: 8812/2022</p>
              </div>

              <div className="border border-amber-300 bg-amber-50/70 rounded-lg p-3 text-amber-950">
                <p className="text-[11px] font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                  Other Rights & Statutory Encumbrances (Itar Hakka):
                </p>
                <p className="text-[11px] mt-1 font-sans">
                  Preliminary Notification under <strong>Section 11(1) of RFCTLARR Act 2013</strong> gazetted on 15-Jan-2024 for public industrial acquisition. No private transfer or mortgage permissible without SLAO approval.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setShow712Modal(false);
                  onToast(`Digitally signed 7/12 extract for ${selectedCadastral.gatNo} generated.`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b2545] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#12335c] transition"
              >
                <Download className="h-3.5 w-3.5" />
                Download Digitally Signed PDF (e-Sign)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE 2: SIA REPORTS (Social Impact Assessment under RFCTLARR)
   ════════════════════════════════════════════════════════════════ */
function SiaReportsPage({
  onToast,
  onViewAcquisition,
}: {
  onToast: (msg: string) => void;
  onViewAcquisition?: (acqId: string) => void;
}) {
  const [reports, setReports] = useState<SiaReport[]>(initialSiaReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState<SiaReport | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // New report form state
  const [newProject, setNewProject] = useState("");
  const [newDistrict, setNewDistrict] = useState("Pune");
  const [newAgency, setNewAgency] = useState("Tata Institute of Social Sciences (TISS)");
  const [newFamilies, setNewFamilies] = useState("");

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch = (r.project + r.district + r.agency + (r.acquisitionId || "")).toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, search, statusFilter]);

  const handleCreateSia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject || !newFamilies) return;

    const newEntry: SiaReport = {
      id: `SIA-2024-0${Math.floor(Math.random() * 90 + 10)}`,
      acquisitionId: `LA-0${Math.floor(Math.random() * 80 + 20)}`,
      project: newProject,
      authority: "MIDC",
      district: newDistrict,
      agency: newAgency,
      status: "Under review",
      families: parseInt(newFamilies, 10),
      scStFamilies: Math.round(parseInt(newFamilies, 10) * 0.15),
      hearingDate: "Pending Scheduling",
      submitted: "Today",
      notifSec4Date: "Just filed",
      summary: "Preliminary notification under Section 4(1) submitted to District Collectorate.",
    };

    setReports([newEntry, ...reports]);
    setShowSubmitModal(false);
    setNewProject("");
    setNewFamilies("");
    onToast(`New SIA study ${newEntry.id} registered under Section 4(1).`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Social Impact Assessment (SIA)</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Mandatory appraisal under Section 4 to 8 of the RFCTLARR Act 2013 covering public hearings and SIMP
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToast("Exported complete SIA registry to CSV")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export Registry
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Register New SIA Study
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          { label: "SIA studies initiated", value: "23", icon: FileText, note: "Under Section 4(1)" },
          { label: "Public hearings held", value: "19", icon: Users, note: "Gram Sabha ratified" },
          { label: "SIMP approved", value: "14", icon: CheckCircle2, note: "Clearance granted" },
          { label: "Affected families (PAF)", value: "1,286", icon: Scale, note: "Rehabilitation mapped" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[12px] text-slate-500">{s.label}</p>
              <p className="text-[18px] font-bold text-slate-900">{s.value}</p>
              <p className="text-[10px] text-slate-400">{s.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-[12px] outline-none transition focus:border-blue-400 focus:bg-white"
            placeholder="Filter by project, district, agency, or Acquisition ID…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {["All", "Approved", "Under review", "Public hearing", "Rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
                statusFilter === st
                  ? "bg-[#1a2744] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* SIA Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold text-slate-500 bg-slate-50/50">
              <th className="px-4 py-2.5">SIA ID</th>
              <th className="px-4 py-2.5">Acquisition ID</th>
              <th className="px-4 py-2.5">Project Title</th>
              <th className="px-4 py-2.5">District</th>
              <th className="px-4 py-2.5">Appointed Agency</th>
              <th className="px-4 py-2.5">Affected Families</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer ${
                  i % 2 === 1 ? "bg-slate-50/30" : ""
                }`}
              >
                <td className="px-4 py-3 font-mono text-[11px] font-semibold text-blue-700">{r.id}</td>
                <td className="px-4 py-3 font-mono text-[11px] font-bold text-blue-700">
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5">
                    {r.acquisitionId}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.project}</td>
                <td className="px-4 py-3 text-slate-600">{r.district}</td>
                <td className="px-4 py-3 text-[12px] text-slate-600">{r.agency}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{r.families} PAF</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onViewAcquisition && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewAcquisition(r.acquisitionId);
                        }}
                        className="rounded px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200"
                      >
                        Acquisition
                      </button>
                    )}
                    <button className="rounded px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100">
                      Dossier
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SIA Dossier Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setSelectedReport(null)}>
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-blue-700">{selectedReport.id}</span>
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                    {selectedReport.acquisitionId}
                  </span>
                </div>
                <h3 className="text-[17px] font-bold text-slate-900">{selectedReport.project}</h3>
                <p className="text-[12px] text-slate-500">District: {selectedReport.district}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-[11px] text-slate-400 block">Expert Assessing Agency</span>
                  <span className="font-medium text-slate-800">{selectedReport.agency}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Sec 4 Notification Date</span>
                  <span className="font-medium text-slate-800">{selectedReport.notifSec4Date}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Displaced Families</span>
                  <span className="font-bold text-slate-900">{selectedReport.families}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">SC/ST Vulnerable Households</span>
                  <span className="font-bold text-amber-700">{selectedReport.scStFamilies} families</span>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-semibold text-slate-800">Executive Summary & SIMP Appraisal:</h4>
                <p className="mt-1 rounded border border-slate-100 bg-slate-50/50 p-3 text-[12px] leading-relaxed text-slate-600">
                  {selectedReport.summary}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-700">Public Hearing Compliance (Sec 5)</p>
                  <p className="text-[11px] text-slate-500">Scheduled Date: {selectedReport.hearingDate}</p>
                </div>
                <StatusBadge status={selectedReport.status} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              {onViewAcquisition && (
                <button
                  onClick={() => {
                    const acqId = selectedReport.acquisitionId;
                    setSelectedReport(null);
                    onViewAcquisition(acqId);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  View Acquisition ({selectedReport.acquisitionId})
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedReport(null);
                  onToast(`Downloaded SIMP evaluation certificate for ${selectedReport.id}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#243352]"
              >
                <Download className="h-3.5 w-3.5" />
                Download Certified SIMP Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New SIA Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setShowSubmitModal(false)}>
          <form onSubmit={handleCreateSia} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Initiate Section 4 SIA Study</h3>
                <p className="text-[11px] text-slate-500">Register statutory study under RFCTLARR Act 2013</p>
              </div>
              <button type="button" onClick={() => setShowSubmitModal(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[12px]">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Project Corridor Name</label>
                <input
                  required
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="e.g. Pune Metro Line 4 Hinjewadi Extension"
                  className="w-full rounded border border-slate-300 p-2 text-[13px] outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-[13px] outline-none"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Thane">Thane</option>
                    <option value="Mumbai Sub">Mumbai Suburban</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Est. Affected Families</label>
                  <input
                    required
                    type="number"
                    value={newFamilies}
                    onChange={(e) => setNewFamilies(e.target.value)}
                    placeholder="e.g. 140"
                    className="w-full rounded border border-slate-300 p-2 text-[13px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Appointed Expert Body</label>
                <select
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-[13px] outline-none"
                >
                  <option value="Tata Institute of Social Sciences (TISS)">Tata Institute of Social Sciences (TISS)</option>
                  <option value="Gokhale Institute of Politics & Economics">Gokhale Institute of Politics & Economics</option>
                  <option value="YASHADA State Social Audit Unit">YASHADA State Social Audit Unit</option>
                  <option value="IIT Bombay Urban Planning Dept">IIT Bombay Urban Planning Dept</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700"
              >
                Register & Gazette Study
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE 3: VALUATIONS (Interactive Solatium & Award Calculator)
   ════════════════════════════════════════════════════════════════ */
function ValuationsPage({
  onToast,
  onViewAcquisition,
}: {
  onToast: (msg: string) => void;
  onViewAcquisition?: (acqId: string) => void;
}) {
  const [valuations, setValuations] = useState<ValuationRecord[]>(initialValuations);
  const [selectedVal, setSelectedVal] = useState<ValuationRecord | null>(null);

  // Live RFCTLARR Calculator State
  const [calcAreaHa, setCalcAreaHa] = useState(1.85);
  const [calcCircleRate, setCalcCircleRate] = useState(4850);
  const [calcMultiplier, setCalcMultiplier] = useState(1.5);
  const [calcAssets, setCalcAssets] = useState(1500000);
  const [calcMonths, setCalcMonths] = useState(8);

  // Statutory Calculations under RFCTLARR 2013
  const calcAreaSqM = calcAreaHa * 10000;
  const baseLandValue = calcAreaSqM * calcCircleRate;
  const multipliedLandValue = baseLandValue * calcMultiplier;
  const totalMarketValue = multipliedLandValue + calcAssets;
  const solatium100 = totalMarketValue; // Section 30(1): 100% solatium
  const interest12Pct = multipliedLandValue * 0.12 * (calcMonths / 12); // Section 30(3)
  const totalFinalAward = totalMarketValue + solatium100 + interest12Pct;

  const handleSaveCalculation = () => {
    const newEntry: ValuationRecord = {
      id: `VAL-${Math.floor(Math.random() * 800 + 1100)}`,
      acquisitionId: `LA-0${Math.floor(Math.random() * 80 + 20)}`,
      project: "Pune–Chakan Industrial Expansion",
      authority: "MIDC",
      parcel: `Survey No. ${Math.floor(Math.random() * 150 + 50)}/${Math.floor(Math.random() * 5 + 1)}`,
      village: "Haveli Rural",
      taluka: "Haveli",
      district: "Pune",
      areaSqM: calcAreaSqM,
      circleRate: calcCircleRate,
      multiplier: calcMultiplier,
      assetsValue: calcAssets,
      solatiumPct: 100,
      totalCr: parseFloat((totalFinalAward / 10000000).toFixed(2)),
      status: "Pending Review",
    };

    setValuations([newEntry, ...valuations]);
    onToast(`Computed Award of ₹${(totalFinalAward / 10000000).toFixed(2)} Cr saved to Valuation Registry.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Land valuation & award computation</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Section 26–31 of the RFCTLARR Act 2013 with multiplier factors, asset appraisals, and 100% mandatory solatium
          </p>
        </div>
        <button
          onClick={() => onToast("Downloaded consolidated compensation statement for district treasury")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Export Treasury Schedule
        </button>
      </div>

      {/* Interactive RFCTLARR Award Calculator */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-700" />
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">
                Statutory Compensation Calculator (Section 26, 29 & 30)
              </h2>
              <p className="text-[11px] text-slate-500">
                Direct calculation adhering to Government of Maharashtra multiplier rules
              </p>
            </div>
          </div>
          <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
            Live Simulator
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Area Required (Hectares)
            </label>
            <input
              type="number"
              step="0.01"
              value={calcAreaHa}
              onChange={(e) => setCalcAreaHa(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 font-mono text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">{calcAreaSqM.toLocaleString("en-IN")} sq.m</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Circle Rate (₹/sq.m)
            </label>
            <input
              type="number"
              step="100"
              value={calcCircleRate}
              onChange={(e) => setCalcCircleRate(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 font-mono text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Ready Reckoner 2024-25</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Rural Multiplier Sec 26(2)
            </label>
            <select
              value={calcMultiplier}
              onChange={(e) => setCalcMultiplier(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-[12px] font-semibold text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="1.0">1.00x (Urban Municipal)</option>
              <option value="1.25">1.25x (Semi-Urban 0-10km)</option>
              <option value="1.5">1.50x (Rural 10-25km)</option>
              <option value="2.0">2.00x (Remote Rural &gt;25km)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Maharashtra gazetted table</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Attached Assets Sec 29 (₹)
            </label>
            <input
              type="number"
              step="50000"
              value={calcAssets}
              onChange={(e) => setCalcAssets(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 font-mono text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Crops, trees, wells, structures</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sec 30(3) Period (Months)
            </label>
            <input
              type="number"
              value={calcMonths}
              onChange={(e) => setCalcMonths(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 font-mono text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">12% p.a. interest period</span>
          </div>
        </div>

        {/* Calculation breakdown summary */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-[12px]">
            <div>
              <p className="text-slate-500">1. Scaled Land Value</p>
              <p className="text-[15px] font-bold text-slate-800">
                ₹{(multipliedLandValue / 10000000).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-slate-400">Base × {calcMultiplier}x</span>
            </div>
            <div>
              <p className="text-slate-500">2. Solatium (100% Sec 30)</p>
              <p className="text-[15px] font-bold text-amber-700">
                ₹{(solatium100 / 10000000).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-slate-400">Mandatory 100% statutory</span>
            </div>
            <div>
              <p className="text-slate-500">3. Sec 30(3) Interest (12%)</p>
              <p className="text-[15px] font-bold text-slate-700">
                ₹{(interest12Pct / 10000000).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-slate-400">{calcMonths} months @ 12% p.a.</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <p className="text-blue-700 font-semibold">Total Award (Sec 31)</p>
              <p className="text-[20px] font-bold text-green-700">
                ₹{(totalFinalAward / 10000000).toFixed(2)} Cr
              </p>
              <span className="text-[10px] text-slate-400">Final gazetted compensation</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[11px] text-slate-500">
              Formula: Award = (Land × Multiplier + Assets) + 100% Solatium + 12% Interest
            </span>
            <button
              onClick={handleSaveCalculation}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[#243352]"
            >
              <Plus className="h-3.5 w-3.5" />
              Commit to Valuation Registry
            </button>
          </div>
        </div>
      </div>

      {/* Valuation Records Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-slate-800">
            Valuation Registry & Section 31 Awards
          </h3>
          <span className="text-[12px] text-slate-500">{valuations.length} records processed</span>
        </div>
        <table className="w-full min-w-[800px] text-[13px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold text-slate-500 bg-slate-50/50">
              <th className="px-4 py-2.5">Valuation ID</th>
              <th className="px-4 py-2.5">Acquisition ID</th>
              <th className="px-4 py-2.5">Parcel / Survey No</th>
              <th className="px-4 py-2.5">Village / District</th>
              <th className="px-4 py-2.5">Circle Rate</th>
              <th className="px-4 py-2.5">Multiplier</th>
              <th className="px-4 py-2.5">Assets (Sec 29)</th>
              <th className="px-4 py-2.5">Total Award</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {valuations.map((v, i) => (
              <tr
                key={v.id}
                onClick={() => setSelectedVal(v)}
                className={`border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer ${
                  i % 2 === 1 ? "bg-slate-50/30" : ""
                }`}
              >
                <td className="px-4 py-3 font-mono text-[11px] font-semibold text-blue-700">{v.id}</td>
                <td className="px-4 py-3 font-mono text-[11px] font-bold text-blue-700">
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5">
                    {v.acquisitionId}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{v.parcel}</td>
                <td className="px-4 py-3 text-slate-600">{v.village}, {v.district}</td>
                <td className="px-4 py-3 font-mono text-slate-700">₹{v.circleRate.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{v.multiplier}x</td>
                <td className="px-4 py-3 font-mono text-slate-600">₹{(v.assetsValue / 100000).toFixed(1)} L</td>
                <td className="px-4 py-3 font-bold text-green-800 font-mono">₹{v.totalCr} Cr</td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onViewAcquisition && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewAcquisition(v.acquisitionId);
                        }}
                        className="rounded px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200"
                      >
                        Acquisition
                      </button>
                    )}
                    <button className="text-[11px] font-semibold text-slate-700 hover:underline">
                      Award Sheet
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Valuation Detail Modal */}
      {selectedVal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setSelectedVal(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-blue-700">{selectedVal.id}</span>
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                    {selectedVal.acquisitionId}
                  </span>
                </div>
                <h3 className="text-[17px] font-bold text-slate-900">{selectedVal.parcel}</h3>
                <p className="text-[12px] text-slate-500">{selectedVal.village}, Taluka: {selectedVal.taluka}</p>
              </div>
              <button onClick={() => setSelectedVal(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-[12px]">
              <div className="flex justify-between rounded bg-slate-50 p-2">
                <span className="text-slate-500">Area Acquired</span>
                <span className="font-mono font-bold text-slate-800">{selectedVal.areaSqM.toLocaleString("en-IN")} sq.m ({(selectedVal.areaSqM / 10000).toFixed(2)} Ha)</span>
              </div>
              <div className="flex justify-between p-1">
                <span className="text-slate-500">Ready Reckoner Base Rate</span>
                <span className="font-mono text-slate-800">₹{selectedVal.circleRate.toLocaleString("en-IN")} / sq.m</span>
              </div>
              <div className="flex justify-between p-1">
                <span className="text-slate-500">Rural Multiplier Factor</span>
                <span className="font-mono text-slate-800">{selectedVal.multiplier}x</span>
              </div>
              <div className="flex justify-between p-1">
                <span className="text-slate-500">Appraised Assets Value (Sec 29)</span>
                <span className="font-mono text-slate-800">₹{selectedVal.assetsValue.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between rounded bg-amber-50 p-2 text-amber-900">
                <span className="font-medium">Mandatory Solatium (100% under Sec 30)</span>
                <span className="font-mono font-bold">100%</span>
              </div>
              <div className="flex justify-between rounded bg-green-50 p-2.5 text-green-900">
                <span className="font-bold">Total Award Amount (Sec 31)</span>
                <span className="font-mono text-[16px] font-bold">₹{selectedVal.totalCr} Crore</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              {onViewAcquisition && (
                <button
                  onClick={() => {
                    const acqId = selectedVal.acquisitionId;
                    setSelectedVal(null);
                    onViewAcquisition(acqId);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  View Acquisition ({selectedVal.acquisitionId})
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedVal(null);
                  onToast(`Generated Section 31 Statutory Award order for ${selectedVal.id}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#243352]"
              >
                <Download className="h-3.5 w-3.5" />
                Download Section 31 Award Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE 4: LITIGATIONS (Court Forums & LARRA Reference Tracker)
   ════════════════════════════════════════════════════════════════ */
function LitigationsPage({
  onToast,
  onViewAcquisition,
}: {
  onToast: (msg: string) => void;
  onViewAcquisition?: (acqId: string) => void;
}) {
  const [cases, setCases] = useState<LitigationCase[]>(initialLitigations);
  const [courtFilter, setCourtFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState<LitigationCase | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // New Case State
  const [newCaseNo, setNewCaseNo] = useState("");
  const [newPetitioner, setNewPetitioner] = useState("");
  const [newCourt, setNewCourt] = useState<LitigationCase["court"]>("Bombay HC");
  const [newType, setNewType] = useState("Sec 26 Valuation Challenge");
  const [newNextDate, setNewNextDate] = useState("2024-10-15");

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchCourt = courtFilter === "All" || c.court.includes(courtFilter);
      const matchSearch = (c.caseNo + c.petitioner + c.project + (c.acquisitionId || "")).toLowerCase().includes(search.toLowerCase());
      return matchCourt && matchSearch;
    });
  }, [cases, courtFilter, search]);

  const handleLogCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseNo || !newPetitioner) return;

    const newEntry: LitigationCase = {
      caseNo: newCaseNo,
      acquisitionId: "LA-001",
      project: "Pune–Chakan Industrial Expansion",
      authority: "MIDC",
      petitioner: newPetitioner,
      respondent: "State of Maharashtra",
      court: newCourt,
      type: newType,
      status: "Hearing",
      nextDate: newNextDate,
      daysRemaining: 14,
      counsel: "Adv. S.V. Deshpande, AGP",
      reliefClaimed: "Notice under Section 64 reference received for reassessment of compensation.",
    };

    setCases([newEntry, ...cases]);
    setShowLogModal(false);
    setNewCaseNo("");
    setNewPetitioner("");
    onToast(`Logged legal dispute ${newCaseNo} in court tracker.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Litigations & court references</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            High Court writ petitions and Section 64 LARRA references with hearing schedules and stay notices
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToast("Exported High Court case schedule to District Collector")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export Causelist
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Court Notice
          </button>
        </div>
      </div>

      {/* Litigation Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          { label: "Active court disputes", value: "137", note: "-2 cases this month", up: true },
          { label: "High Court interim stays", value: "12", note: "Immediate reply required", up: false },
          { label: "LARRA Sec 64 claims", value: "62", note: "Compensation disputes", up: true },
          { label: "Hearings this fortnight", value: "24", note: "AGP brief prepared", up: true },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
            <p className="text-[12px] text-slate-500">{s.label}</p>
            <p className="text-[20px] font-bold text-slate-900 mt-0.5">{s.value}</p>
            <p className={`text-[11px] font-medium mt-0.5 ${s.up ? "text-slate-400" : "text-red-600 font-semibold"}`}>
              {s.note}
            </p>
          </div>
        ))}
      </div>

      {/* Filter and search */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-[12px] outline-none transition focus:border-blue-400 focus:bg-white"
            placeholder="Search case number, petitioner, project, or Acquisition ID…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {["All", "Bombay HC", "RCTLARR", "Civil Court"].map((c) => (
            <button
              key={c}
              onClick={() => setCourtFilter(c)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
                courtFilter === c
                  ? "bg-[#1a2744] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Litigations Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-[13px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold text-slate-500 bg-slate-50/50">
              <th className="px-4 py-2.5">Case Number</th>
              <th className="px-4 py-2.5">Acquisition ID</th>
              <th className="px-4 py-2.5">Petitioner vs Respondent</th>
              <th className="px-4 py-2.5">Court / Forum</th>
              <th className="px-4 py-2.5">Dispute Type</th>
              <th className="px-4 py-2.5">Next Hearing</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.caseNo}
                onClick={() => setSelectedCase(c)}
                className={`border-t border-slate-100 hover:bg-blue-50/40 cursor-pointer ${
                  i % 2 === 1 ? "bg-slate-50/30" : ""
                }`}
              >
                <td className="px-4 py-3 font-mono text-[11px] font-bold text-blue-700">{c.caseNo}</td>
                <td className="px-4 py-3 font-mono text-[11px] font-bold text-blue-700">
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5">
                    {c.acquisitionId}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{c.petitioner}</p>
                  <p className="text-[11px] text-slate-400">vs {c.respondent}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{c.court}</td>
                <td className="px-4 py-3 text-[12px] text-slate-600">{c.type}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-800">{c.nextDate}</span>
                  <span className={`block text-[10px] ${c.daysRemaining <= 5 ? "text-red-600 font-bold" : "text-slate-400"}`}>
                    In {c.daysRemaining} days
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onViewAcquisition && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewAcquisition(c.acquisitionId);
                        }}
                        className="rounded px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200"
                      >
                        Acquisition
                      </button>
                    )}
                    <button className="rounded px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100">
                      Case Brief
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Case Brief Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setSelectedCase(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-blue-700">{selectedCase.caseNo}</span>
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                    {selectedCase.acquisitionId}
                  </span>
                </div>
                <h3 className="text-[17px] font-bold text-slate-900">{selectedCase.petitioner}</h3>
                <p className="text-[12px] text-slate-500">Forum: {selectedCase.court}</p>
              </div>
              <button onClick={() => setSelectedCase(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[12px]">
              <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Corridor Project:</span>
                  <span className="font-semibold text-slate-800">{selectedCase.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">State Counsel (AGP):</span>
                  <span className="font-medium text-slate-800">{selectedCase.counsel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Hearing Date:</span>
                  <span className="font-bold text-blue-700">{selectedCase.nextDate}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">Grounds of Challenge & Relief Claimed:</h4>
                <p className="mt-1 rounded border border-slate-100 bg-slate-50/50 p-3 leading-relaxed text-slate-600">
                  {selectedCase.reliefClaimed}
                </p>
              </div>

              {selectedCase.status === "Interim stay" && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-red-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-700" />
                    Interim Injunction Operating
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Possession hand-over stayed. Collectorate instructed to file reply affidavit before next listing date.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              {onViewAcquisition && (
                <button
                  onClick={() => {
                    const acqId = selectedCase.acquisitionId;
                    setSelectedCase(null);
                    onViewAcquisition(acqId);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  View Acquisition ({selectedCase.acquisitionId})
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedCase(null);
                  onToast(`Downloaded legal dossier for ${selectedCase.caseNo}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#243352]"
              >
                <Download className="h-3.5 w-3.5" />
                Download AGP Briefing File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log New Case Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setShowLogModal(false)}>
          <form onSubmit={handleLogCase} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Log New Court Challenge</h3>
                <p className="text-[11px] text-slate-500">Record notice or writ petition</p>
              </div>
              <button type="button" onClick={() => setShowLogModal(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[12px]">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Case Number</label>
                <input
                  required
                  value={newCaseNo}
                  onChange={(e) => setNewCaseNo(e.target.value)}
                  placeholder="e.g. WP/2024/2941"
                  className="w-full rounded border border-slate-300 p-2 text-[13px] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Petitioner Name</label>
                <input
                  required
                  value={newPetitioner}
                  onChange={(e) => setNewPetitioner(e.target.value)}
                  placeholder="e.g. Dnyaneshwar Kashinath Shinde"
                  className="w-full rounded border border-slate-300 p-2 text-[13px] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Court Forum</label>
                  <select
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value as LitigationCase["court"])}
                    className="w-full rounded border border-slate-300 p-2 text-[12px] outline-none"
                  >
                    <option value="Bombay HC">Bombay High Court</option>
                    <option value="RCTLARR Authority">LARRA Authority</option>
                    <option value="Civil Court, Raigad">Civil Court</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Next Listing Date</label>
                  <input
                    type="date"
                    value={newNextDate}
                    onChange={(e) => setNewNextDate(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-[12px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Challenge Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-[12px] outline-none"
                >
                  <option value="Sec 26 Valuation Challenge">Section 26 Valuation Challenge</option>
                  <option value="Section 64 Reference">Section 64 Reference for Enhancement</option>
                  <option value="Title Dispute">Title & Heirship Dispute</option>
                  <option value="Rehabilitation Package">Rehabilitation Deficiency (Sec 16)</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700"
              >
                Register Case Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE 5: REHABILITATION & RESETTLEMENT (R&R) — SCHEDULE II
   ════════════════════════════════════════════════════════════════ */
export interface RnRScheme {
  id: string;
  schemeName: string;
  projectId: string;
  projectName: string;
  authority: AuthorityCode;
  state: string;
  district: string;
  resettlementEnclave: string;
  totalPfs: number; // Project Affected Families (Sec 3(c))
  displacedPfs: number; // Project Displaced Families
  scStFamilies: number;
  housingAllotted: number;
  housingTarget: number;
  totalPackageCr: number;
  disbursedCr: number;
  subsistenceAllowancePaid: boolean;
  status: "Completed" | "In Progress" | "Review";
  gazetteNoticeRef: string;
  administrator: string;
  amenitiesCount: number; // out of 25 amenities under Third Schedule
}

const initialRnRSchemes: RnRScheme[] = [
  {
    id: "RNR-MH-01",
    schemeName: "Wadgaon Sheri - Chakan Industrial Corridor Model R&R Township",
    projectId: "MIDC-PUN-01",
    projectName: "MIDC Chakan Phase-IV Industrial Corridor",
    authority: "MIDC",
    state: "Maharashtra",
    district: "Pune",
    resettlementEnclave: "Wadgaon Sheri Sector-4 Model Township",
    totalPfs: 1240,
    displacedPfs: 420,
    scStFamilies: 185,
    housingAllotted: 395,
    housingTarget: 420,
    totalPackageCr: 38.4,
    disbursedCr: 35.2,
    subsistenceAllowancePaid: true,
    status: "In Progress",
    gazetteNoticeRef: "Maha-Gov-RNR-2024/091",
    administrator: "Sanjay K. Shinde, Addl. Collector (R&R)",
    amenitiesCount: 23,
  },
  {
    id: "RNR-KA-01",
    schemeName: "Bidaluru Grama Aerospace Defense Park Resettlement Enclave",
    projectId: "KIADB-BLR-01",
    projectName: "KIADB Devanahalli Aerospace Park",
    authority: "KIADB",
    state: "Karnataka",
    district: "Bengaluru Rural",
    resettlementEnclave: "Bidaluru Grama Model Resettlement Enclave",
    totalPfs: 860,
    displacedPfs: 280,
    scStFamilies: 110,
    housingAllotted: 265,
    housingTarget: 280,
    totalPackageCr: 27.6,
    disbursedCr: 26.1,
    subsistenceAllowancePaid: true,
    status: "In Progress",
    gazetteNoticeRef: "GOK-CI-RNR-144/2023",
    administrator: "Venkatesh Prasad, KAS (CLAO)",
    amenitiesCount: 22,
  },
  {
    id: "RNR-GJ-01",
    schemeName: "Sanand Auto Greenfield Rehabilitation Nagar",
    projectId: "GIDC-AHM-01",
    projectName: "GIDC Sanand Auto Cluster Expansion",
    authority: "GIDC",
    state: "Gujarat",
    district: "Ahmedabad",
    resettlementEnclave: "Sanand Greenfield Rehabilitation Nagar",
    totalPfs: 950,
    displacedPfs: 310,
    scStFamilies: 75,
    housingAllotted: 310,
    housingTarget: 310,
    totalPackageCr: 31.5,
    disbursedCr: 31.5,
    subsistenceAllowancePaid: true,
    status: "Completed",
    gazetteNoticeRef: "GOJ-REV-LAQ-2023/88",
    administrator: "Bhavesh Dave, GAS",
    amenitiesCount: 25,
  },
  {
    id: "RNR-TN-01",
    schemeName: "Vallam-Vadagal Electronics City Rehabilitation Nagar",
    projectId: "SIPCOT-CHE-01",
    projectName: "SIPCOT Sriperumbudur Electronics City",
    authority: "SIPCOT",
    state: "Tamil Nadu",
    district: "Kanchipuram",
    resettlementEnclave: "Vallam-Vadagal Resettlement Nagar",
    totalPfs: 1120,
    displacedPfs: 240,
    scStFamilies: 190,
    housingAllotted: 190,
    housingTarget: 240,
    totalPackageCr: 28.2,
    disbursedCr: 21.4,
    subsistenceAllowancePaid: true,
    status: "In Progress",
    gazetteNoticeRef: "GOTN-IND-SIPCOT-412/2024",
    administrator: "K. Meenakshi, DRO (Land Acquisition)",
    amenitiesCount: 21,
  },
  {
    id: "RNR-RJ-01",
    schemeName: "Behror Rural Resettlement Township (Japanese Zone Ext.)",
    projectId: "RIICO-ALW-01",
    projectName: "RIICO Neemrana Industrial Area Ph-III",
    authority: "RIICO",
    state: "Rajasthan",
    district: "Alwar",
    resettlementEnclave: "Behror Rural Resettlement Township",
    totalPfs: 650,
    displacedPfs: 160,
    scStFamilies: 60,
    housingAllotted: 140,
    housingTarget: 160,
    totalPackageCr: 17.1,
    disbursedCr: 14.8,
    subsistenceAllowancePaid: true,
    status: "In Progress",
    gazetteNoticeRef: "GOR-IND-LAQ-772/2024",
    administrator: "Ram Niwas Meena, RAS",
    amenitiesCount: 20,
  },
];

function RnRPage({
  onToast,
  onViewAcquisition,
}: {
  onToast: (msg: string) => void;
  onViewAcquisition: (id: string) => void;
}) {
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityCode>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<RnRScheme | null>(null);

  const filteredSchemes = useMemo(() => {
    return initialRnRSchemes.filter((s) => {
      const matchesAuth = selectedAuthority === "ALL" || s.authority === selectedAuthority;
      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        s.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.district.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesAuth && matchesStatus && matchesSearch;
    });
  }, [selectedAuthority, statusFilter, searchTerm]);

  // Aggregate stats
  const totalPAFs = initialRnRSchemes.reduce((acc, s) => acc + s.totalPfs, 0);
  const totalPDFs = initialRnRSchemes.reduce((acc, s) => acc + s.displacedPfs, 0);
  const totalHousingAllotted = initialRnRSchemes.reduce((acc, s) => acc + s.housingAllotted, 0);
  const totalHousingTarget = initialRnRSchemes.reduce((acc, s) => acc + s.housingTarget, 0);
  const totalDisbursedCr = initialRnRSchemes.reduce((acc, s) => acc + s.disbursedCr, 0);
  const totalPackageCr = initialRnRSchemes.reduce((acc, s) => acc + s.totalPackageCr, 0);

  return (
    <div className="space-y-5 font-sans">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
              Rehabilitation & Resettlement (R&R) Statutory Monitoring
            </h1>
            <span className="rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 border border-emerald-300">
              RFCTLARR 2013 • SCHEDULE II
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Mandatory census of Project Affected Families (PAFs) & Displaced Families (PDFs), constructed house allotments, and PFMS DBT subsistence grants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToast("National R&R Progress Report exported successfully.")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Download className="h-3.5 w-3.5" />
            Export National R&R Dossier (PDF)
          </button>
        </div>
      </div>

      {/* 4 National Statutory R&R KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
              Affected Families (PAFs)
            </span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-[26px] font-extrabold text-slate-900">
            {totalPAFs.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Section 3(c) statutory baseline census
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
              Displaced Families (PDFs)
            </span>
            <Home className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-[26px] font-extrabold text-slate-900">
            {totalPDFs.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Mandatory physical relocation required
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
              Housing Units Handover
            </span>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[26px] font-extrabold text-slate-900">
              {totalHousingAllotted.toLocaleString("en-IN")}
            </span>
            <span className="text-[13px] text-slate-500 font-semibold">
              / {totalHousingTarget.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full"
              style={{ width: `${(totalHousingAllotted / totalHousingTarget) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {((totalHousingAllotted / totalHousingTarget) * 100).toFixed(1)}% possession certified
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">
              R&R Package Disbursed
            </span>
            <Landmark className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[26px] font-extrabold text-slate-900">
              ₹{totalDisbursedCr.toFixed(1)} Cr
            </span>
            <span className="text-[13px] text-slate-500 font-semibold">
              / ₹{totalPackageCr.toFixed(1)} Cr
            </span>
          </div>
          <p className="text-[11px] text-green-700 font-medium mt-1">
            Direct Benefit Transfer (PFMS / NPCI)
          </p>
        </div>
      </div>

      {/* Statutory Schedule II Entitlement Matrix Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-blue-700" />
          <h3 className="text-[13px] font-bold text-blue-950 uppercase tracking-wide">
            Statutory Schedule II Entitlements Guaranteed by Law
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-[11px]">
          <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
            <p className="font-bold text-slate-900">1. Constructed House</p>
            <p className="text-slate-600 mt-0.5">Min 50 sq.m rural / 20 sq.m urban dwelling</p>
          </div>
          <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
            <p className="font-bold text-slate-900">2. Resettlement Grant</p>
            <p className="text-slate-600 mt-0.5">One-time ₹50,000 per displaced family</p>
          </div>
          <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
            <p className="font-bold text-slate-900">3. Subsistence Grant</p>
            <p className="text-slate-600 mt-0.5">₹3,000/month for 12 months (₹36,000)</p>
          </div>
          <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
            <p className="font-bold text-slate-900">4. Annuity / Job</p>
            <p className="text-slate-600 mt-0.5">Job per family or ₹5,00,000 lump sum</p>
          </div>
          <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
            <p className="font-bold text-slate-900">5. Cattle / Shop Cost</p>
            <p className="text-slate-600 mt-0.5">₹25,000 cattle shed / petty shop transport</p>
          </div>
          <div className="rounded-lg bg-white p-2.5 border border-blue-100 shadow-2xs">
            <p className="font-bold text-slate-900">6. SC/ST Enhancement</p>
            <p className="text-slate-600 mt-0.5">+25% additional one-time R&R allowance</p>
          </div>
        </div>
      </div>

      {/* Authority Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "MIDC", "KIADB", "GIDC", "SIPCOT", "RIICO"] as AuthorityCode[]).map((auth) => (
            <button
              key={auth}
              onClick={() => setSelectedAuthority(auth)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                selectedAuthority === auth
                  ? "bg-[#0b2545] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {auth === "ALL" ? "All Statutory Schemes (5)" : `${auth}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scheme or district..."
              className="h-8 w-full rounded-md border border-slate-300 pl-8 pr-2.5 text-[11px] outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-slate-300 px-2 text-[11px] font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Under Review</option>
          </select>
        </div>
      </div>

      {/* R&R Scheme Register Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-[#0b2545] text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">R&R Scheme & Industrial Corridor</th>
                <th className="px-4 py-3">Nodal Authority</th>
                <th className="px-4 py-3">Affected (PAFs)</th>
                <th className="px-4 py-3">Displaced (PDFs)</th>
                <th className="px-4 py-3">Housing Allotment</th>
                <th className="px-4 py-3">R&R Package (₹ Cr)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Statutory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchemes.map((s) => {
                const housingPct = Math.round((s.housingAllotted / s.housingTarget) * 100);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{s.schemeName}</p>
                      <p className="text-[11px] text-slate-500">{s.projectName} • {s.district}, {s.state}</p>
                      <span className="font-mono text-[10px] text-blue-700 font-semibold">{s.gazetteNoticeRef}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 font-bold text-blue-800 text-[11px]">
                        {s.authority}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">{s.administrator}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {s.totalPfs.toLocaleString("en-IN")}
                      <p className="text-[10px] font-normal text-slate-500">{s.scStFamilies} SC/ST families</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-800">
                      {s.displacedPfs.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-900">{s.housingAllotted} / {s.housingTarget}</span>
                        <span className="text-[10px] text-emerald-700 font-bold">{housingPct}%</span>
                      </div>
                      <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${housingPct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-slate-900">₹{s.disbursedCr} Cr</p>
                      <p className="text-[10px] text-slate-500">Pool: ₹{s.totalPackageCr} Cr</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${
                          s.status === "Completed"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : s.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {s.status === "Completed" && <CheckCircle2 className="h-3 w-3" />}
                        {s.status === "In Progress" && <Clock3 className="h-3 w-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedScheme(s)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#0b2545] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-900 shadow-2xs transition"
                      >
                        <FileText className="h-3 w-3 text-amber-300" />
                        View Decree
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory R&R Gazette Decree Modal */}
      {selectedScheme && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedScheme(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Masthead */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <AshokaEmblem className="h-12 w-auto" />
                <div>
                  <p className="text-[11px] font-serif font-bold text-slate-700">भारत सरकार • GOVERNMENT OF INDIA</p>
                  <h2 className="text-[16px] font-extrabold text-[#0b2545]">
                    Statutory R&R Scheme Gazette Allotment Decree
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 font-mono">
                    Under Sections 31, 38 & Second Schedule of RFCTLARR Act 2013
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scheme Metadata */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
              <div>
                <span className="text-slate-500">Gazette Order Ref:</span>
                <p className="font-mono font-bold text-blue-900">{selectedScheme.gazetteNoticeRef}</p>
              </div>
              <div>
                <span className="text-slate-500">R&R Administrator:</span>
                <p className="font-semibold text-slate-800">{selectedScheme.administrator}</p>
              </div>
              <div>
                <span className="text-slate-500">Resettlement Township:</span>
                <p className="font-semibold text-slate-800">{selectedScheme.resettlementEnclave}</p>
              </div>
              <div>
                <span className="text-slate-500">Infrastructure Amenities:</span>
                <p className="font-semibold text-emerald-800">
                  {selectedScheme.amenitiesCount} / 25 Schedule III Amenities Verified
                </p>
              </div>
            </div>

            {/* Itemized Entitlement Package Breakdown */}
            <div className="mt-4">
              <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wide mb-2">
                Itemized Schedule II Financial Entitlement Package
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Statutory Element</th>
                      <th className="p-2">Legal Provision</th>
                      <th className="p-2">Entitlement Norm</th>
                      <th className="p-2 text-right">PFMS Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-semibold">Constructed House</td>
                      <td className="p-2 font-mono text-slate-500">Schedule II Para 1</td>
                      <td className="p-2">Min 50 sq.m Pucca Unit in Township</td>
                      <td className="p-2 text-right font-bold text-emerald-700">Allotted ({selectedScheme.housingAllotted} units)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Resettlement Grant</td>
                      <td className="p-2 font-mono text-slate-500">Schedule II Para 7</td>
                      <td className="p-2">One-time ₹50,000 per family</td>
                      <td className="p-2 text-right font-bold text-emerald-700">100% Disbursed</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Subsistence Grant</td>
                      <td className="p-2 font-mono text-slate-500">Schedule II Para 5</td>
                      <td className="p-2">₹3,000/month for 12 months (₹36,000)</td>
                      <td className="p-2 text-right font-bold text-emerald-700">Active (DBT Credit)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Mandatory Job / Annuity</td>
                      <td className="p-2 font-mono text-slate-500">Schedule II Para 4</td>
                      <td className="p-2">Industrial Job or ₹5,00,000 lump sum</td>
                      <td className="p-2 text-right font-bold text-blue-700">In Progress</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">SC/ST Special Package</td>
                      <td className="p-2 font-mono text-slate-500">Section 41(6)</td>
                      <td className="p-2">+25% additional grant for {selectedScheme.scStFamilies} families</td>
                      <td className="p-2 text-right font-bold text-purple-700">Certified by Collector</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statutory Digital Signature Stamp */}
            <div className="mt-5 rounded-lg border border-emerald-300 bg-emerald-50/60 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] text-emerald-950 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Digitally Authenticated by Special Land Acquisition Officer (SLAO) via e-Sign</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                DSC-GOI-2024-V3
              </span>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedScheme(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const pid = selectedScheme.projectId;
                  setSelectedScheme(null);
                  onViewAcquisition(pid);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-700 hover:bg-blue-100"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                View Project Dossier ({selectedScheme.projectId})
              </button>
              <button
                onClick={() => {
                  onToast(`Gazette Decree ${selectedScheme.gazetteNoticeRef} downloaded.`);
                  setSelectedScheme(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b2545] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-blue-900 shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-amber-300" />
                Download Formal R&R Decree (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE 6: SETTINGS & ADMINISTRATION
   ════════════════════════════════════════════════════════════════ */
function SettingsPage({ onToast }: { onToast: (msg: string) => void }) {
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "security" | "integrations">("general");

  // Interactive toggle states
  const [smsDbtAlerts, setSmsDbtAlerts] = useState(true);
  const [slaoEmailAlerts, setSlaoEmailAlerts] = useState(true);
  const [hcStayAlerts, setHcStayAlerts] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [aadhaarEsign, setAadhaarEsign] = useState(true);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Portal administration & configuration</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">
          Departmental parameters, DBT disbursement gateway, security & audit logs
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-[13px] font-medium">
        {[
          { key: "general", label: "Department Profile" },
          { key: "notifications", label: "Notification Protocols" },
          { key: "security", label: "Security & e-Sign" },
          { key: "integrations", label: "State Integrations" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`border-b-2 px-4 py-2.5 transition ${
              activeTab === t.key
                ? "border-blue-600 font-semibold text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              Nodal Land Acquisition Authority
            </h3>
            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Department</label>
                <p className="font-semibold text-slate-800">Revenue & Forest Department, Maharashtra</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Operational Divisions</label>
                <p className="text-slate-700">Pune, Konkan, Nashik, Aurangabad, Amravati, Nagpur</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500">Active Financial Year</label>
                <p className="font-mono font-semibold text-slate-800">2024–2025 (FY25)</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-[14px] font-semibold text-slate-800 flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-slate-500" />
              System Metrics & Storage
            </h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Database Storage:</span>
                <span className="font-mono text-slate-800">14.8 GB of 100 GB</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "15%" }} />
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Total Indexed Parcels:</span>
                <span className="font-mono font-bold text-slate-800">48,291</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Encrypted Backup Frequency:</span>
                <span className="text-slate-700">Daily at 02:00 IST (NIC Cloud)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === "notifications" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Farmer SMS Broadcast on DBT Award Deposit</p>
              <p className="text-[11px] text-slate-400">Send direct SMS alert to land owner upon PFMS bank transfer</p>
            </div>
            <button
              onClick={() => { setSmsDbtAlerts(!smsDbtAlerts); onToast("Updated SMS broadcast rule."); }}
              className={`h-6 w-11 rounded-full transition-colors relative ${smsDbtAlerts ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${smsDbtAlerts ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Weekly SLAO Section 19 Expiry Warnings</p>
              <p className="text-[11px] text-slate-400">Alert Special Land Acquisition Officers 30 days before statutory deadline</p>
            </div>
            <button
              onClick={() => { setSlaoEmailAlerts(!slaoEmailAlerts); onToast("Updated SLAO notification threshold."); }}
              className={`h-6 w-11 rounded-full transition-colors relative ${slaoEmailAlerts ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${slaoEmailAlerts ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Immediate High Court Injunction Alerts</p>
              <p className="text-[11px] text-slate-400">Flash urgent alerts to District Collector & Government Pleader</p>
            </div>
            <button
              onClick={() => { setHcStayAlerts(!hcStayAlerts); onToast("Updated HC alert dispatch."); }}
              className={`h-6 w-11 rounded-full transition-colors relative ${hcStayAlerts ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${hcStayAlerts ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Security */}
      {activeTab === "security" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Two-Factor Authentication (2FA) for Award Approvals</p>
              <p className="text-[11px] text-slate-400">Mandate OTP verification via Aadhaar-linked mobile for Section 31 awards</p>
            </div>
            <button
              onClick={() => { setTwoFactorAuth(!twoFactorAuth); onToast("2FA policy updated."); }}
              className={`h-6 w-11 rounded-full transition-colors relative ${twoFactorAuth ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${twoFactorAuth ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-slate-800">Aadhaar e-Sign / Class-3 DSC Requirement</p>
              <p className="text-[11px] text-slate-400">Require digital signature token for all gazetted compensation awards</p>
            </div>
            <button
              onClick={() => { setAadhaarEsign(!aadhaarEsign); onToast("Digital signature token policy updated."); }}
              className={`h-6 w-11 rounded-full transition-colors relative ${aadhaarEsign ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${aadhaarEsign ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Integrations */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[
            { name: "Mahabhulekh (7/12 Records)", status: "Active", ping: "42ms", desc: "Live sync of RoR land titles & Gat numbers" },
            { name: "PFMS (Direct Benefit Transfer)", status: "Active", ping: "110ms", desc: "Direct treasury compensation deposit gateway" },
            { name: "Digilocker Document Repository", status: "Active", ping: "68ms", desc: "Automatic delivery of Section 31 award certificates" },
            { name: "Bhuvan ISRO Satellite Layer", status: "Active", ping: "92ms", desc: "High-resolution geospatial imagery & cadastral maps" },
          ].map((int) => (
            <div key={int.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{int.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{int.desc}</p>
                <span className="mt-2 inline-block font-mono text-[10px] text-slate-400">Latency: {int.ping}</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                {int.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE 0: DASHBOARD OVERVIEW (Simplified, Clean National Portal)
   ════════════════════════════════════════════════════════════════ */
function DashboardOverview({
  selectedAuthority,
  onSelectAuthority,
  onViewProject,
  onNavigate,
  onToast,
  onViewAcquisition,
}: {
  selectedAuthority: AuthorityCode;
  onSelectAuthority: (auth: AuthorityCode) => void;
  onViewProject: (proj: Project) => void;
  filtered?: NotificationRow[];
  statusFilter?: "All" | Status;
  setStatusFilter?: (s: "All" | Status) => void;
  setSelected?: (n: NotificationRow) => void;
  onNavigate: (tab: string) => void;
  onToast: (msg: string) => void;
  onViewAcquisition?: (acqId: string) => void;
}) {
  const [selectedMapPlot, setSelectedMapPlot] = useState<string>("LA-001");

  // Filter 3-4 active priority projects
  const displayProjects = useMemo(() => {
    if (selectedAuthority === "ALL") {
      // Pick top 4 active projects across states
      return projects.slice(0, 4);
    }
    return projects.filter((p) => p.authority === selectedAuthority).slice(0, 4);
  }, [selectedAuthority]);

  // Dynamic 4 Key KPIs based on selected authority
  const dynamicKpiData = useMemo(() => {
    const auth = authorities[selectedAuthority];
    if (selectedAuthority === "ALL") {
      return [
        {
          label: "Land Acquired",
          value: "23,930.5",
          unit: "hectares",
          trend: "+5.4%",
          up: true,
          subtitle: "Target: 28,500 Ha (84.0% Acquired)",
        },
        {
          label: "Compensation Disbursed",
          value: "₹1,801.7",
          unit: "crore",
          trend: "+9.2%",
          up: true,
          subtitle: "Pool: ₹2,450 Cr (Direct DBT via PFMS)",
        },
        {
          label: "Active Litigations",
          value: "137",
          unit: "cases",
          trend: "-2.4%",
          up: true,
          subtitle: "Section 64 & High Court stays",
        },
        {
          label: "Pending SIA Clearances",
          value: "56",
          unit: "cases",
          trend: "89.2% Cleared",
          up: false,
          subtitle: "Section 4 RFCTLARR Public Hearings",
        },
      ];
    }
    return [
      {
        label: `${auth.name} Land Acquired`,
        value: auth.landUnderAcquisitionHa.toLocaleString(),
        unit: "hectares",
        trend: "+6.1%",
        up: true,
        subtitle: `Demarcated area in ${auth.state}`,
      },
      {
        label: "Compensation Disbursed",
        value: `₹${auth.disbursedCr}`,
        unit: "crore",
        trend: "+11.4%",
        up: true,
        subtitle: `Pool: ₹${auth.compensationCr} Cr via PFMS`,
      },
      {
        label: "Active Litigations",
        value: String(auth.activeLitigation),
        unit: "cases",
        trend: "-1.8%",
        up: true,
        subtitle: "High Court & Tribunal stays",
      },
      {
        label: "Pending SIA Clearances",
        value: String(auth.pendingSia),
        unit: "cases",
        trend: "Under Sec 4",
        up: false,
        subtitle: "Mandatory Social Appraisal",
      },
    ];
  }, [selectedAuthority]);

  // Mini Map Cadastral parcels sample
  const miniMapParcels = [
    {
      acqId: "LA-001",
      gat: "Gat No. 142/3A",
      ulpin: "MH-PUN-2024-8841",
      owner: "Kashinath D. Patil",
      area: "4.85 Ha",
      project: "Pune–Chakan Industrial Expansion",
      status: "Cleared",
      comp: "₹3.40 Cr",
      poly: "M 35 25 L 90 20 L 110 65 L 45 75 Z",
      cx: 70,
      cy: 45,
    },
    {
      acqId: "LA-002",
      gat: "Gat No. 88/2",
      ulpin: "MH-PUN-2024-9102",
      owner: "Suresh Baburao Shinde",
      area: "3.20 Ha",
      project: "Pune–Chakan Industrial Expansion",
      status: "Disputed",
      comp: "₹2.24 Cr",
      poly: "M 115 22 L 180 30 L 165 80 L 112 68 Z",
      cx: 145,
      cy: 50,
    },
    {
      acqId: "LA-003",
      gat: "Plot No. 410",
      ulpin: "GJ-AHM-2024-0012",
      owner: "Bipinbhai Patel & Bros",
      area: "8.50 Ha",
      project: "Dholera Industrial Development",
      status: "Pending",
      comp: "₹5.95 Cr",
      poly: "M 185 32 L 260 25 L 245 85 L 170 82 Z",
      cx: 215,
      cy: 55,
    },
    {
      acqId: "LA-004",
      gat: "Plot No. 18/B",
      ulpin: "GJ-AHM-2024-0098",
      owner: "Rameshbhai K. Dave",
      area: "2.75 Ha",
      project: "Sanand Auto Industrial Corridor",
      status: "Cleared",
      comp: "₹1.92 Cr",
      poly: "M 40 82 L 110 72 L 95 130 L 30 135 Z",
      cx: 70,
      cy: 105,
    },
    {
      acqId: "LA-005",
      gat: "Survey No. 77",
      ulpin: "TN-KRI-2024-3310",
      owner: "K. Subramanian",
      area: "6.10 Ha",
      project: "Hosur Industrial Expansion",
      status: "Pending",
      comp: "₹4.27 Cr",
      poly: "M 115 75 L 170 85 L 160 140 L 100 133 Z",
      cx: 135,
      cy: 110,
    },
    {
      acqId: "LA-007",
      gat: "Survey No. 204",
      ulpin: "TN-KAN-2024-1189",
      owner: "M. Jayaraman & Sons",
      area: "5.40 Ha",
      project: "Sriperumbudur Industrial Area",
      status: "Cleared",
      comp: "₹3.78 Cr",
      poly: "M 175 88 L 255 90 L 240 145 L 165 142 Z",
      cx: 210,
      cy: 115,
    },
  ];

  const currentSelectedParcel =
    miniMapParcels.find((p) => p.acqId === selectedMapPlot) || miniMapParcels[0];

  // Priority Pending Actions Queue (Time-Bound Statutory Tasks)
  const pendingActions = [
    {
      id: "act-1",
      acquisitionId: "LA-001",
      section: "Sec 4(5)",
      title: "SIA Public Hearing Notice Due",
      project: "Pune–Chakan Industrial Expansion (MIDC)",
      authority: "MIDC",
      urgency: "Urgent • 5 Days",
      urgencyColor: "bg-red-50 text-red-700 border-red-200",
      desc: "Mandatory public hearing gazette notification draft pending SLAO Pune sign-off.",
    },
    {
      id: "act-2",
      acquisitionId: "LA-003",
      section: "Sec 30",
      title: "Valuation Award Collector Approval",
      project: "Dholera Industrial Development (GIDC)",
      authority: "GIDC",
      urgency: "Review Required",
      urgencyColor: "bg-blue-50 text-blue-700 border-blue-200",
      desc: "₹34.2 Cr land valuation award package approved by SLAO, pending Collector sign-off.",
    },
    {
      id: "act-3",
      acquisitionId: "LA-002",
      section: "Sec 64",
      title: "High Court Counter-Affidavit Deadline",
      project: "Pune–Chakan Industrial Expansion (MIDC)",
      authority: "MIDC",
      urgency: "Deadline • 7 Days",
      urgencyColor: "bg-amber-50 text-amber-700 border-amber-200",
      desc: "Bombay High Court WP 4102/2024 notice on ready-reckoner multiplication factor.",
    },
    {
      id: "act-4",
      acquisitionId: "LA-004",
      section: "PFMS DBT",
      title: "Compensation Direct Disbursal Release",
      project: "Sanand Auto Industrial Corridor (GIDC)",
      authority: "GIDC",
      urgency: "Pending Treasury",
      urgencyColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: "₹14.8 Cr compensation tranche verified for 38 Khatadars ready for e-disbursal.",
    },
    {
      id: "act-5",
      acquisitionId: "LA-007",
      section: "Sec 38",
      title: "Joint Demarcation & Possession Handover",
      project: "Sriperumbudur Industrial Area (SIPCOT)",
      authority: "SIPCOT",
      urgency: "Scheduled Next Week",
      urgencyColor: "bg-purple-50 text-purple-700 border-purple-200",
      desc: "Final boundary verification and patta transfer inspection with Tahsildar.",
    },
  ];

  return (
    <>
      {/* 1. Authority Tabs Navigation */}
      <AuthorityTabBar
        selectedAuthority={selectedAuthority}
        onSelectAuthority={onSelectAuthority}
      />

      {/* 2. Authority Header Banner (Contextual) */}
      <AuthorityDashboardHeader
        authorityCode={selectedAuthority}
        onToast={onToast}
      />

      {/* 3. 4 Key KPIs */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicKpiData.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </section>

      {/* 4. Overall Acquisition Progress Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-700" />
              <span>Overall Statutory Acquisition Progress</span>
            </h2>
            <p className="text-[12px] text-slate-500">
              National land demarcation, award declaration, and statutory possession across state industrial development corporations
            </p>
          </div>
          <button
            onClick={() => onNavigate("Spatial Map")}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 hover:text-blue-900 self-start sm:self-center transition"
          >
            <span>Open Spatial Cadastral Map (GIS)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Big National Progress Meter */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[26px] font-extrabold text-slate-900 font-mono tracking-tight">84.0%</span>
                <span className="text-[12px] text-slate-500 ml-2 font-medium">Demarcation Target Achieved</span>
              </div>
              <span className="font-mono text-[12px] font-bold text-slate-700">
                23,930.5 / 28,500.0 <span className="font-normal text-slate-400">Hectares</span>
              </span>
            </div>

            {/* Visual Master Progress Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#1a2744] via-blue-600 to-emerald-500 transition-all duration-700"
                style={{ width: "84%" }}
              />
            </div>

            {/* Authority Breakdown Micro-Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { auth: "MIDC (MH)", pct: 78, ha: "4,056 Ha", color: "bg-blue-600" },
                { auth: "GIDC (GJ)", pct: 84, ha: "5,544 Ha", color: "bg-emerald-600" },
                { auth: "SIPCOT (TN)", pct: 72, ha: "2,613 Ha", color: "bg-teal-600" },
                { auth: "RIICO (RJ)", pct: 68, ha: "2,482 Ha", color: "bg-amber-600" },
                { auth: "KIADB (KA)", pct: 64, ha: "2,912 Ha", color: "bg-indigo-600" },
              ].map((b) => (
                <div key={b.auth} className="rounded-lg bg-slate-50 border border-slate-200/70 p-2 text-center">
                  <p className="text-[10px] font-bold text-slate-600 truncate">{b.auth}</p>
                  <p className="text-[13px] font-bold font-mono text-slate-900 mt-0.5">{b.pct}%</p>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 mt-1">{b.ha}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metric Indicators */}
          <div className="space-y-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Statutory Efficiency Rates
            </p>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-600">PFMS Compensation Disbursal:</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px]">
                73.5% (₹1,801.7 Cr)
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-600">SIA Appraisal Clearance Rate:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                89.2% (453 / 509)
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-600">Cadastral Geo-referencing:</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[11px]">
                94.2% ULPIN Linked
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3–4 Active Projects Section */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-[16px] font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-blue-700" />
              <span>
                {selectedAuthority === "ALL"
                  ? "Active Industrial Acquisition Corridors"
                  : `${selectedAuthority} Major Active Projects`}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                {displayProjects.length}
              </span>
            </h2>
            <p className="text-[12px] text-slate-500">
              Key projects under active statutory land acquisition lifecycle with linked Acquisition IDs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("Spatial Map")}
              className="text-[12px] font-semibold text-blue-700 hover:underline"
            >
              View All Cadastral Maps →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {displayProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onViewProject={onViewProject}
            />
          ))}
        </div>
      </section>

      {/* 6. Two-Column Lower Section: Small Map Preview + Pending Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
        {/* Left Column: Small Map Preview */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Cadastral Spatial Preview (GIS)</h3>
                  <p className="text-[11px] text-slate-500">Live surveyed land parcels with Acquisition ID tags</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                <CircleDot className="h-2.5 w-2.5 text-blue-600 animate-pulse" />
                Bhuvan ISRO Layer
              </span>
            </div>

            {/* Interactive SVG Cadastral Map Viewport */}
            <div className="mt-3 relative rounded-lg bg-[#0f172a] p-3 border border-slate-800 overflow-hidden text-white min-h-[190px]">
              {/* Satellite Grid Background Styling */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

              {/* Cadastral SVG Polygon Map */}
              <svg className="relative z-10 w-full h-[140px]" viewBox="0 0 280 150">
                {miniMapParcels.map((p) => {
                  const isSelected = p.acqId === selectedMapPlot;
                  const fillColor =
                    p.status === "Cleared"
                      ? "rgba(34, 197, 94, 0.45)"
                      : p.status === "Pending"
                      ? "rgba(245, 158, 11, 0.45)"
                      : "rgba(239, 68, 68, 0.45)";
                  const strokeColor =
                    isSelected ? "#ffffff" : p.status === "Cleared" ? "#4ade80" : p.status === "Pending" ? "#fcd34d" : "#f87171";

                  return (
                    <g key={p.acqId} className="cursor-pointer" onClick={() => setSelectedMapPlot(p.acqId)}>
                      <path
                        d={p.poly}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? "2.5" : "1.2"}
                        className="transition-all hover:opacity-90"
                      />
                      <text
                        x={p.cx}
                        y={p.cy}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow-sm"
                      >
                        {p.acqId}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Selected Mini Plot Inspector Overlay */}
              <div className="relative z-10 mt-1 rounded-md bg-slate-900/90 border border-slate-700/80 p-2 flex items-center justify-between text-[11px]">
                <div className="truncate mr-2">
                  <span className="font-mono font-bold text-amber-400 mr-1.5">{currentSelectedParcel.acqId}</span>
                  <span className="text-slate-300">{currentSelectedParcel.gat} • {currentSelectedParcel.area}</span>
                  <span className="text-slate-400 block text-[10px] truncate">{currentSelectedParcel.owner}</span>
                </div>
                {onViewAcquisition && (
                  <button
                    onClick={() => onViewAcquisition(currentSelectedParcel.acqId)}
                    className="shrink-0 rounded bg-blue-600 hover:bg-blue-500 px-2 py-1 text-[10px] font-bold text-white transition flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
            <span className="text-slate-500 font-mono">
              48,200 plots mapped across 5 authorities
            </span>
            <button
              onClick={() => onNavigate("Spatial Map")}
              className="font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              Open Spatial Map <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Pending Actions Queue */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900">Priority Statutory Actions</h3>
                  <p className="text-[11px] text-slate-500">Pending gazette hearings, awards & tribunal deadlines</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700">
                5 Pending
              </span>
            </div>

            {/* List of Pending Actions */}
            <div className="mt-3 space-y-2.5 divide-y divide-slate-100/80">
              {pendingActions.map((act) => (
                <div key={act.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-2.5">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                        {act.acquisitionId}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-100 px-1 py-0.2 rounded">
                        {act.section}
                      </span>
                      <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${act.urgencyColor}`}>
                        {act.urgency}
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-slate-800 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{act.desc}</p>
                  </div>

                  {onViewAcquisition && (
                    <button
                      onClick={() => onViewAcquisition(act.acquisitionId)}
                      title={`Open dossier for ${act.acquisitionId}`}
                      className="shrink-0 rounded-lg border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <span>Resolve</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
              RFCTLARR Act 2013 Statutory Compliance
            </span>
            <span className="font-mono text-[10px]">NIC Node-04</span>
          </div>
        </div>
      </section>

      {/* Institutional Compliance & Sync Footer */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-blue-600" />
          Last National Sync: Today, 18:42 IST (NIC Server Node-04)
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          DEMO / PROTOTYPE DATA — FOR STATUTORY EVALUATION & REVIEW ONLY
        </span>
      </section>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN ROUTER: LandAcquisitionDashboard
   ════════════════════════════════════════════════════════════════ */
export default function LandAcquisitionDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [selectedAuthority, setSelectedAuthority] = useState<AuthorityCode>("ALL");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [selected, setSelected] = useState<NotificationRow | null>(null);
  const [selectedAcquisitionId, setSelectedAcquisitionId] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  const filtered = useMemo(
    () =>
      notifications.filter((n) => {
        const q = query.toLowerCase();
        const matchAuth = selectedAuthority === "ALL" || n.authority === selectedAuthority;
        const matchQuery = `${n.project} ${n.ulpin} ${n.district} ${n.gatNo} ${n.acquisitionId} ${n.authority}`.toLowerCase().includes(q);
        const matchStatus = statusFilter === "All" || n.status === statusFilter;
        return matchAuth && matchQuery && matchStatus;
      }),
    [query, statusFilter, selectedAuthority],
  );

  const nav = (label: string) => {
    setActive(label);
    if (label !== "Dashboard") {
      setSelectedProject(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans text-slate-800 flex flex-col">
      {/* Official Government Tricolor Top Ribbon */}
      <div className="h-1 w-full bg-linear-to-r from-[#ff9933] via-white to-[#138808] shrink-0" />

      {/* Topmost Accessibility & Language Utility Bar (GIGW Compliant) */}
      <div className="border-b border-slate-200 bg-slate-100/90 px-4 sm:px-8 py-1 text-[11px] text-slate-600 flex items-center justify-end gap-3 font-medium">
        <a href="#main-content" className="hover:text-blue-700 hover:underline">Skip to main content</a>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1.5 font-sans">
          <span className="text-[10px] text-slate-400">Font:</span>
          <button onClick={() => showToast("Font size adjusted to standard")} className="hover:text-blue-700 px-1 py-0.5 rounded text-[10px] text-slate-600">A-</button>
          <button onClick={() => showToast("Font size adjusted to standard")} className="hover:text-blue-700 px-1 py-0.5 rounded text-[11px] font-bold text-slate-800">A</button>
          <button onClick={() => showToast("Font size adjusted to enlarged")} className="hover:text-blue-700 px-1 py-0.5 rounded text-[12px] font-bold text-slate-800">A+</button>
        </div>
        <span className="text-slate-300">|</span>
        <button onClick={() => showToast("Language toggled: English / हिन्दी")} className="hover:text-blue-700">
          English / हिन्दी
        </button>
      </div>

      {/* Official National Government Masthead */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-[1440px] mx-auto w-full">
          {/* Left: Ashoka Emblem & Bilingual Titles */}
          <div className="flex items-center gap-4">
            <AshokaEmblem className="h-16 w-auto shrink-0 text-slate-900" />
            <div>
              <p className="text-[12px] font-medium text-slate-700 tracking-wide font-serif">
                राष्ट्रीय भूमि अधिग्रहण निगरानी पोर्टल
              </p>
              <h1 className="text-[18px] sm:text-[21px] font-extrabold tracking-tight text-[#0b2545] uppercase font-sans leading-tight">
                NATIONAL LAND ACQUISITION MONITORING PORTAL
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                Department of Land Resources • Ministry of Rural Development, Government of India
              </p>
            </div>
          </div>

          {/* Right: Search, Notifications & Nodal Officer */}
          <div className="flex items-center gap-3 self-end lg:self-center">
            {/* Search Input */}
            <div className="relative w-60 sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-[12px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                placeholder="Search ULPIN, Gat No, Acquisition ID..."
              />
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setBellOpen((v) => !v)}
                className="relative rounded-md border border-slate-200 bg-slate-50 p-2 hover:bg-slate-100 text-slate-600 transition"
                aria-label="Gazetted Alerts"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-1 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                  <p className="px-1 py-1 text-[13px] font-semibold text-slate-800 border-b border-slate-100 pb-2">
                    Priority Gazetted Alerts
                  </p>
                  <div className="divide-y divide-slate-50 mt-1">
                    {notifications.slice(0, 4).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { setSelected(n); setBellOpen(false); }}
                        className="w-full rounded-md px-2 py-2 text-left hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <p className="truncate text-[12px] font-medium text-slate-800">
                            {n.project}
                          </p>
                          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                            {n.acquisitionId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {n.authority} • {n.gatNo}, {n.status}, {n.updated}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Officer Profile Badge */}
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/90 px-3 py-1 text-left">
              <span className="grid h-8 w-8 place-items-center rounded bg-[#0b2545] font-bold text-white text-[11px]">
                RS
              </span>
              <div className="leading-tight">
                <span className="block text-[12px] font-bold text-slate-800">Raj Sharma, IAS</span>
                <span className="block text-[10px] text-slate-500">Special Land Acquisition Officer (SLAO)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Horizontal Navigation Bar (Deep Navy #0b2545) */}
      <nav
        className="bg-[#0b2545] text-white px-4 sm:px-8 border-b border-[#081b33] shadow-xs no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="max-w-[1440px] mx-auto flex items-center justify-between overflow-x-auto no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            {navItems.map(({ label, icon: Icon, badge, badgeColor }) => {
              const on = active === label;
              return (
                <button
                  key={label}
                  onClick={() => nav(label)}
                  className={`relative flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                    on
                      ? "text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${on ? "text-amber-400" : "text-slate-300"}`} />
                  <span>{label}</span>
                  {badge && (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${badgeColor || "bg-amber-400/20 text-amber-300 border border-amber-400/30"}`}>
                      {badge}
                    </span>
                  )}
                  {on && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-400 rounded-t-sm" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-amber-300/90 whitespace-nowrap pl-3">
            <span>NIC Node:</span>
            <span className="font-bold text-amber-200">DL-SEC-04</span>
          </div>
        </div>
      </nav>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#0b2545] px-4 py-2.5 text-[12px] font-medium text-white shadow-xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area (Full Width, Centered) */}
      <main id="main-content" className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 space-y-5 flex-1">
        {active === "Dashboard" && selectedProject && (
          <ProjectDetailsView
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
            onViewAcquisition={(id) => setSelectedAcquisitionId(id)}
            onNavigate={nav}
            onToast={showToast}
          />
        )}

        {active === "Dashboard" && !selectedProject && (
          <DashboardOverview
            selectedAuthority={selectedAuthority}
            onSelectAuthority={(auth) => {
              setSelectedAuthority(auth);
              setSelectedProject(null);
            }}
            onViewProject={(proj) => setSelectedProject(proj)}
            filtered={filtered}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setSelected={setSelected}
            onNavigate={nav}
            onToast={showToast}
            onViewAcquisition={(id) => setSelectedAcquisitionId(id)}
          />
        )}

        {active === "Spatial Map" && (
          <SpatialMapPage
            onToast={showToast}
            onViewAcquisition={(id) => setSelectedAcquisitionId(id)}
          />
        )}

        {active === "SIA Reports" && (
          <SiaReportsPage
            onToast={showToast}
            onViewAcquisition={(id) => setSelectedAcquisitionId(id)}
          />
        )}

        {active === "Valuations" && (
          <ValuationsPage
            onToast={showToast}
            onViewAcquisition={(id) => setSelectedAcquisitionId(id)}
          />
        )}

        {active === "Litigations" && (
          <LitigationsPage
            onToast={showToast}
            onViewAcquisition={(id) => setSelectedAcquisitionId(id)}
          />
        )}

        {active === "R&R Scheme" && (
          <RnRPage
            onToast={showToast}
            onViewAcquisition={(id) => setSelectedAcquisitionId(id)}
          />
        )}

        {active === "Settings" && <SettingsPage onToast={showToast} />}
      </main>

      {/* ── Notification / Parcel Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                    {selected.acquisitionId}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    {selected.authority}
                  </span>
                  <h3 className="text-[16px] font-bold text-slate-900">{selected.project}</h3>
                </div>
                <p className="text-[11px] font-medium text-slate-500">Gazetted acquisition record</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md p-1.5 hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 font-mono text-[12px]">
              {[
                ["Acquisition ID", selected.acquisitionId],
                ["Authority", selected.authority],
                ["ULPIN", selected.ulpin],
                ["Gat / Survey", selected.gatNo],
                ["District", selected.district],
                ["Area Required", `${selected.areaHa} Hectare`],
                ["Khatadar", selected.khatadar],
                ["Est. Award", `₹${selected.compensationCr} Cr`],
                ["Status", selected.status],
                ["Last Gazette", selected.updated],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-sans font-medium text-slate-400">{k}</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-slate-800 truncate">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  const acqId = selected.acquisitionId;
                  setSelected(null);
                  setSelectedAcquisitionId(acqId);
                }}
                className="flex-1 rounded-lg bg-[#2563eb] py-2 text-[12px] font-semibold text-white hover:bg-blue-700 transition flex items-center justify-center gap-1"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                View Acquisition ({selected.acquisitionId})
              </button>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unified Acquisition Details Dossier Modal ── */}
      {selectedAcquisitionId && (
        <AcquisitionDetailsModal
          acquisitionId={selectedAcquisitionId}
          onClose={() => setSelectedAcquisitionId(null)}
          onNavigate={nav}
          onToast={showToast}
        />
      )}
    </div>
  );
}

