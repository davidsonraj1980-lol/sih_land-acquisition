/* ── types & models ── */
export type Status = "Pending" | "Cleared" | "Disputed";

export type AuthorityCode = "ALL" | "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";

export type AcquisitionStage =
  | "Land Identification"
  | "SIA"
  | "Notification"
  | "Objection / Hearing"
  | "Valuation"
  | "Compensation"
  | "Possession";

export interface Authority {
  code: AuthorityCode;
  name: string;
  fullName: string;
  state: string;
  logoShort: string;
  activeProjects: number;
  landUnderAcquisitionHa: number;
  totalParcels: number;
  compensationCr: number;
  disbursedCr: number;
  pendingSia: number;
  activeLitigation: number;
  headquarters: string;
  nodalOfficer: string;
  designation: string;
  description: string;
  badgeColor: string;
}

export interface Project {
  id: string;
  name: string;
  authority: "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";
  state: string;
  district: string;
  totalAreaHa: number;
  acquiredAreaHa: number;
  totalParcels: number;
  currentStage: AcquisitionStage;
  currentStageIndex: number; // 0 to 6
  progressPct: number;
  status: "Active" | "Fast-Track" | "Near Completion" | "Planning";
  acquisitionIdRange: string;
  primaryAcquisitionId: string;
  nodalOfficer: string;
  gazetteNotificationRef: string;
  estimatedCompensationCr: number;
  disbursedCompensationCr: number;
  description: string;
  sector: string;
  targetCompletion: string;
}

export interface NotificationRow {
  id: string;
  acquisitionId: string;
  project: string;
  authority: "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";
  ulpin: string;
  district: string;
  gatNo: string;
  areaHa: number;
  status: Status;
  updated: string;
  khatadar: string;
  compensationCr: number;
}

export interface Parcel {
  id: string;
  acquisitionId: string;
  project: string;
  authority: "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";
  gatNo: string;
  ulpin: string;
  village: string;
  taluka: string;
  district: string;
  owner: string;
  areaTotalHa: number;
  areaAcquiredHa: number;
  classification: "Jirayat (Dry)" | "Bagayat (Irrigated)" | "Non-Agricultural";
  circleRate: number; // in INR/sq.m
  status: Status;
  polyPoints: string;
  center: [number, number];
}

export interface SiaReport {
  id: string;
  acquisitionId: string;
  project: string;
  authority: "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";
  district: string;
  agency: string;
  status: "Approved" | "Under review" | "Public hearing" | "Rejected";
  families: number;
  scStFamilies: number;
  hearingDate: string;
  submitted: string;
  notifSec4Date: string;
  summary: string;
}

export interface ValuationRecord {
  id: string;
  acquisitionId: string;
  project: string;
  authority: "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";
  parcel: string;
  village: string;
  taluka: string;
  district: string;
  areaSqM: number;
  circleRate: number;
  multiplier: number;
  assetsValue: number;
  solatiumPct: number;
  totalCr: number;
  status: "Approved" | "Pending Review" | "Under Objection";
}

export interface LitigationCase {
  caseNo: string;
  acquisitionId: string;
  project: string;
  authority: "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";
  petitioner: string;
  respondent: string;
  court: "Bombay HC" | "Gujarat HC" | "Madras HC" | "Rajasthan HC" | "Karnataka HC" | "RCTLARR Authority" | "Civil Court, Raigad" | "District Court, Pune";
  type: string;
  status: "Hearing" | "Pending orders" | "Interim stay" | "Evidence stage";
  nextDate: string;
  daysRemaining: number;
  counsel: string;
  reliefClaimed: string;
}

export interface CompensationRecord {
  acquisitionId: string;
  project: string;
  authority: "MIDC" | "GIDC" | "SIPCOT" | "RIICO" | "KIADB";
  totalCr: number;
  disbursedCr: number;
  mode: string;
  status: "Cleared" | "Pending" | "Disputed";
  dbtRef?: string;
  bankAccountLinked: boolean;
  notes: string;
}

/* ── Authorities Dictionary ── */
export const authorities: Record<AuthorityCode, Authority> = {
  ALL: {
    code: "ALL",
    name: "National Portal",
    fullName: "National Land Acquisition Monitoring Portal (NLAMP)",
    state: "All India (Multi-State)",
    logoShort: "NLAMP",
    activeProjects: 11,
    landUnderAcquisitionHa: 23930.5,
    totalParcels: 5120,
    compensationCr: 2810.0,
    disbursedCr: 1801.7,
    pendingSia: 56,
    activeLitigation: 137,
    headquarters: "New Delhi, Bharat",
    nodalOfficer: "Dr. K. S. Murthy, IAS",
    designation: "Additional Secretary (Land Resources), MoRD",
    description: "Unified monitoring platform across statutory State Industrial Development Corporations under RFCTLARR Act 2013.",
    badgeColor: "bg-slate-800 text-white",
  },
  MIDC: {
    code: "MIDC",
    name: "MIDC",
    fullName: "Maharashtra Industrial Development Corporation",
    state: "Maharashtra",
    logoShort: "MIDC",
    activeProjects: 3,
    landUnderAcquisitionHa: 5450.5,
    totalParcels: 1282,
    compensationCr: 544.5,
    disbursedCr: 206.4,
    pendingSia: 14,
    activeLitigation: 42,
    headquarters: "Udyog Bhavan, Mumbai",
    nodalOfficer: "Raj Sharma, IAS",
    designation: "Special Land Acquisition Officer (SLAO - Western Region)",
    description: "Statutory industrial infrastructure development authority under Maharashtra Industrial Development Act, 1961.",
    badgeColor: "bg-blue-700 text-white",
  },
  GIDC: {
    code: "GIDC",
    name: "GIDC",
    fullName: "Gujarat Industrial Development Corporation",
    state: "Gujarat",
    logoShort: "GIDC",
    activeProjects: 2,
    landUnderAcquisitionHa: 6600.0,
    totalParcels: 1380,
    compensationCr: 910.0,
    disbursedCr: 688.0,
    pendingSia: 8,
    activeLitigation: 26,
    headquarters: "Udhyog Bhavan, Gandhinagar",
    nodalOfficer: "Bhavna Patel, GAS",
    designation: "General Manager (Land & Estate) & Special Collector",
    description: "Apex body for accelerated industrial growth and Special Investment Region (SIR) land acquisition in Gujarat.",
    badgeColor: "bg-amber-700 text-white",
  },
  SIPCOT: {
    code: "SIPCOT",
    name: "SIPCOT",
    fullName: "State Industries Promotion Corporation of Tamil Nadu",
    state: "Tamil Nadu",
    logoShort: "SIPCOT",
    activeProjects: 2,
    landUnderAcquisitionHa: 3630.0,
    totalParcels: 810,
    compensationCr: 520.0,
    disbursedCr: 440.4,
    pendingSia: 11,
    activeLitigation: 18,
    headquarters: "Rukumani Lakshmipathy Road, Egmore, Chennai",
    nodalOfficer: "K. Senthamarai, IAS",
    designation: "Special District Revenue Officer (Land Acquisition)",
    description: "Promoting mega auto clusters, electronics corridors, and defense parks across Tamil Nadu.",
    badgeColor: "bg-emerald-700 text-white",
  },
  RIICO: {
    code: "RIICO",
    name: "RIICO",
    fullName: "Rajasthan State Industrial Development and Investment Corporation",
    state: "Rajasthan",
    logoShort: "RIICO",
    activeProjects: 2,
    landUnderAcquisitionHa: 3650.0,
    totalParcels: 820,
    compensationCr: 450.0,
    disbursedCr: 282.0,
    pendingSia: 9,
    activeLitigation: 24,
    headquarters: "Udyog Bhawan, Tilak Marg, Jaipur",
    nodalOfficer: "Mahendra Singh Rathore, RAS",
    designation: "Advisor (Infrastructure & Land Records)",
    description: "Pioneering DMIC nodes, Japanese Zones, and greenfield solar & engineering hubs across Rajasthan.",
    badgeColor: "bg-orange-700 text-white",
  },
  KIADB: {
    code: "KIADB",
    name: "KIADB",
    fullName: "Karnataka Industrial Areas Development Board",
    state: "Karnataka",
    logoShort: "KIADB",
    activeProjects: 2,
    landUnderAcquisitionHa: 4550.0,
    totalParcels: 1010,
    compensationCr: 605.0,
    disbursedCr: 353.5,
    pendingSia: 14,
    activeLitigation: 27,
    headquarters: "Khanija Bhavan, Race Course Road, Bengaluru",
    nodalOfficer: "Venkatesh Prasad, KAS",
    designation: "Chief Land Acquisition Officer (CLAO - North & South)",
    description: "Statutory board establishing hi-tech defense, aerospace, and semiconductor corridors under KIAD Act 1966.",
    badgeColor: "bg-indigo-700 text-white",
  },
};

/* ── 7-Stage Acquisition Lifecycle ── */
export const acquisitionStages: { stage: AcquisitionStage; label: string; refAct: string; shortDesc: string }[] = [
  { stage: "Land Identification", label: "Stage 1: Land Identification", refAct: "Sec 3(1)", shortDesc: "Cadastral survey & feasibility assessment" },
  { stage: "SIA", label: "Stage 2: SIA & Hearing", refAct: "Sec 4 to 8", shortDesc: "Social Impact Assessment & SIMP appraisal" },
  { stage: "Notification", label: "Stage 3: Statutory Notification", refAct: "Sec 11 / 19", shortDesc: "Preliminary & Final Gazette Notification" },
  { stage: "Objection / Hearing", label: "Stage 4: Claims & Objections", refAct: "Sec 15 / 21", shortDesc: "Public inquiry by SLAO & Joint Measurement" },
  { stage: "Valuation", label: "Stage 5: Valuation & Award", refAct: "Sec 26 to 30", shortDesc: "Ready Reckoner, Multiplier & 100% Solatium" },
  { stage: "Compensation", label: "Stage 6: DBT Compensation", refAct: "Sec 31 to 38", shortDesc: "Direct Benefit Transfer via PFMS Escrow" },
  { stage: "Possession", label: "Stage 7: Possession & Handover", refAct: "Sec 38 / 40", shortDesc: "Vesting free from all encumbrances" },
];

/* ── Realistic Multi-State Project Repositories ── */
export const projects: Project[] = [
  /* MIDC Projects */
  {
    id: "proj-midc-1",
    name: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    state: "Maharashtra",
    district: "Pune",
    totalAreaHa: 1850.5,
    acquiredAreaHa: 1443.4,
    totalParcels: 412,
    currentStage: "Valuation",
    currentStageIndex: 4,
    progressPct: 78,
    status: "Active",
    acquisitionIdRange: "LA-001 – LA-006",
    primaryAcquisitionId: "LA-001",
    nodalOfficer: "Raj Sharma, IAS (SLAO Pune)",
    gazetteNotificationRef: "MH-REV/SEC26/2024/092",
    estimatedCompensationCr: 184.5,
    disbursedCompensationCr: 122.8,
    description: "Expansion of Chakan Auto & EV Manufacturing Hub linking Talegaon, Wadgaon Sheri and Khed corridors.",
    sector: "Automotive & Electric Mobility",
    targetCompletion: "Q3 2025",
  },
  {
    id: "proj-midc-2",
    name: "Nagpur Industrial Corridor",
    authority: "MIDC",
    state: "Maharashtra",
    district: "Nagpur",
    totalAreaHa: 2400.0,
    acquiredAreaHa: 1080.0,
    totalParcels: 580,
    currentStage: "SIA",
    currentStageIndex: 1,
    progressPct: 45,
    status: "Active",
    acquisitionIdRange: "LA-009",
    primaryAcquisitionId: "LA-009",
    nodalOfficer: "Dr. Aniruddh Mane, SLAO Nagpur",
    gazetteNotificationRef: "MH-REV/SEC4/2024/041",
    estimatedCompensationCr: 245.0,
    disbursedCompensationCr: 68.4,
    description: "Multimodal logistics hub alongside Samruddhi Mahamarg spur for Central India freight transshipment.",
    sector: "Logistics & Multimodal Freight",
    targetCompletion: "Q4 2026",
  },
  {
    id: "proj-midc-3",
    name: "Aurangabad Industrial Zone",
    authority: "MIDC",
    state: "Maharashtra",
    district: "Chhatrapati Sambhajinagar",
    totalAreaHa: 1200.0,
    acquiredAreaHa: 384.0,
    totalParcels: 290,
    currentStage: "Notification",
    currentStageIndex: 2,
    progressPct: 32,
    status: "Planning",
    acquisitionIdRange: "LA-010 – LA-012",
    primaryAcquisitionId: "LA-010",
    nodalOfficer: "Smita Kadam, Dy. Collector (LA)",
    gazetteNotificationRef: "MH-REV/SEC11/2024/104",
    estimatedCompensationCr: 115.0,
    disbursedCompensationCr: 15.2,
    description: "AURIC node extension for engineering and pharmaceutical manufacturing clusters.",
    sector: "Pharmaceuticals & Precision Engineering",
    targetCompletion: "Q1 2027",
  },

  /* GIDC Projects */
  {
    id: "proj-gidc-1",
    name: "Sanand Industrial Expansion",
    authority: "GIDC",
    state: "Gujarat",
    district: "Ahmedabad",
    totalAreaHa: 2100.0,
    acquiredAreaHa: 1428.0,
    totalParcels: 460,
    currentStage: "Objection / Hearing",
    currentStageIndex: 3,
    progressPct: 68,
    status: "Active",
    acquisitionIdRange: "LA-013 – LA-015",
    primaryAcquisitionId: "LA-013",
    nodalOfficer: "Bhavna Patel, GAS (Collector LA)",
    gazetteNotificationRef: "GJ-GIDC/SEC15/2024/018",
    estimatedCompensationCr: 290.0,
    disbursedCompensationCr: 175.4,
    description: "Sanand Phase-III semiconductor packaging ecosystem and advanced electronics assembly hub.",
    sector: "Semiconductors & Electronics",
    targetCompletion: "Q2 2025",
  },
  {
    id: "proj-gidc-2",
    name: "Dholera Industrial Development",
    authority: "GIDC",
    state: "Gujarat",
    district: "Ahmedabad (SIR)",
    totalAreaHa: 4500.0,
    acquiredAreaHa: 3780.0,
    totalParcels: 920,
    currentStage: "Compensation",
    currentStageIndex: 5,
    progressPct: 84,
    status: "Fast-Track",
    acquisitionIdRange: "LA-016 – LA-018",
    primaryAcquisitionId: "LA-016",
    nodalOfficer: "K. R. Vaghela, Special Officer (Dholera SIR)",
    gazetteNotificationRef: "GJ-GIDC/SEC19/2024/007",
    estimatedCompensationCr: 620.0,
    disbursedCompensationCr: 512.6,
    description: "Dholera Special Investment Region Activation Area land vesting for green hydrogen and aero-structures.",
    sector: "Heavy Industries & Green Energy",
    targetCompletion: "Q4 2025",
  },

  /* SIPCOT Projects */
  {
    id: "proj-sipcot-1",
    name: "Hosur Industrial Expansion",
    authority: "SIPCOT",
    state: "Tamil Nadu",
    district: "Krishnagiri",
    totalAreaHa: 1650.0,
    acquiredAreaHa: 1188.0,
    totalParcels: 380,
    currentStage: "Valuation",
    currentStageIndex: 4,
    progressPct: 72,
    status: "Active",
    acquisitionIdRange: "LA-019 – LA-021",
    primaryAcquisitionId: "LA-019",
    nodalOfficer: "K. Senthamarai, DRO (Land Acquisition)",
    gazetteNotificationRef: "TN-SIP/SEC26/2024/055",
    estimatedCompensationCr: 210.0,
    disbursedCompensationCr: 145.0,
    description: "Mega EV 2-wheeler and battery giga-factory industrial park adjoining National Highway 44.",
    sector: "EV & Battery Storage",
    targetCompletion: "Q3 2025",
  },
  {
    id: "proj-sipcot-2",
    name: "Sriperumbudur Industrial Area",
    authority: "SIPCOT",
    state: "Tamil Nadu",
    district: "Kanchipuram",
    totalAreaHa: 1980.0,
    acquiredAreaHa: 1801.8,
    totalParcels: 430,
    currentStage: "Possession",
    currentStageIndex: 6,
    progressPct: 91,
    status: "Near Completion",
    acquisitionIdRange: "LA-022 – LA-024",
    primaryAcquisitionId: "LA-022",
    nodalOfficer: "M. Ramanathan, SLAO SIPCOT",
    gazetteNotificationRef: "TN-SIP/SEC31/2024/012",
    estimatedCompensationCr: 310.0,
    disbursedCompensationCr: 295.4,
    description: "Final phase possession for hardware electronics export processing zone and R&D campuses.",
    sector: "IT Hardware & Export Processing",
    targetCompletion: "Q1 2025",
  },

  /* RIICO Projects */
  {
    id: "proj-riico-1",
    name: "Jaipur Industrial Area Expansion",
    authority: "RIICO",
    state: "Rajasthan",
    district: "Jaipur",
    totalAreaHa: 1400.0,
    acquiredAreaHa: 728.0,
    totalParcels: 310,
    currentStage: "SIA",
    currentStageIndex: 1,
    progressPct: 52,
    status: "Active",
    acquisitionIdRange: "LA-025 – LA-027",
    primaryAcquisitionId: "LA-025",
    nodalOfficer: "Mahendra Singh Rathore, RAS",
    gazetteNotificationRef: "RJ-RIC/SEC4/2024/083",
    estimatedCompensationCr: 165.0,
    disbursedCompensationCr: 54.0,
    description: "Sitapura extension and gems/jewelry special manufacturing zone with solar microgrid support.",
    sector: "Light Engineering & Handicrafts",
    targetCompletion: "Q3 2026",
  },
  {
    id: "proj-riico-2",
    name: "Neemrana Industrial Zone",
    authority: "RIICO",
    state: "Rajasthan",
    district: "Kotputli-Behror",
    totalAreaHa: 2250.0,
    acquiredAreaHa: 1800.0,
    totalParcels: 510,
    currentStage: "Compensation",
    currentStageIndex: 5,
    progressPct: 80,
    status: "Active",
    acquisitionIdRange: "LA-028 – LA-030",
    primaryAcquisitionId: "LA-028",
    nodalOfficer: "R. C. Sharma, Sub-Divisional Officer",
    gazetteNotificationRef: "RJ-RIC/SEC19/2024/034",
    estimatedCompensationCr: 285.0,
    disbursedCompensationCr: 228.0,
    description: "DMIC-aligned Japanese industrial township expansion for automotive ancillary and machinery fabrication.",
    sector: "Heavy Engineering & Auto Ancillaries",
    targetCompletion: "Q4 2025",
  },

  /* KIADB Projects */
  {
    id: "proj-kiadb-1",
    name: "Bengaluru Industrial Expansion",
    authority: "KIADB",
    state: "Karnataka",
    district: "Bengaluru Rural",
    totalAreaHa: 2800.0,
    acquiredAreaHa: 1792.0,
    totalParcels: 620,
    currentStage: "Objection / Hearing",
    currentStageIndex: 3,
    progressPct: 64,
    status: "Active",
    acquisitionIdRange: "LA-031 – LA-033",
    primaryAcquisitionId: "LA-031",
    nodalOfficer: "Venkatesh Prasad, KAS (CLAO)",
    gazetteNotificationRef: "KA-KIA/SEC28/2024/061",
    estimatedCompensationCr: 410.0,
    disbursedCompensationCr: 245.0,
    description: "Aerospace and defense manufacturing zone near Kempegowda International Airport Devanahalli.",
    sector: "Aerospace & Defense",
    targetCompletion: "Q2 2026",
  },
  {
    id: "proj-kiadb-2",
    name: "Dharwad Industrial Area",
    authority: "KIADB",
    state: "Karnataka",
    district: "Dharwad",
    totalAreaHa: 1750.0,
    acquiredAreaHa: 1015.0,
    totalParcels: 390,
    currentStage: "Valuation",
    currentStageIndex: 4,
    progressPct: 58,
    status: "Active",
    acquisitionIdRange: "LA-034 – LA-036",
    primaryAcquisitionId: "LA-034",
    nodalOfficer: "Shankarappa Patil, SLAO Dharwad",
    gazetteNotificationRef: "KA-KIA/SEC28/2024/048",
    estimatedCompensationCr: 195.0,
    disbursedCompensationCr: 108.5,
    description: "FMCG and heavy engineering cluster along Pune–Bengaluru economic corridor.",
    sector: "Consumer Goods & Precision Tools",
    targetCompletion: "Q4 2025",
  },
];

/* ── Cadastral Land Parcels (Linked across all Projects) ── */
export const cadastralParcels: Parcel[] = [
  /* MIDC - Pune-Chakan */
  {
    id: "p1",
    acquisitionId: "LA-001",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    gatNo: "Gat No. 142/3A",
    ulpin: "MH-PUN-24-001423",
    village: "Wadgaon Sheri",
    taluka: "Haveli",
    district: "Pune",
    owner: "Ramesh Narayanrao Deshmukh",
    areaTotalHa: 3.12,
    areaAcquiredHa: 1.65,
    classification: "Bagayat (Irrigated)",
    circleRate: 5200,
    status: "Disputed",
    polyPoints: "370,30 520,50 540,165 390,140",
    center: [455, 95],
  },
  {
    id: "p2",
    acquisitionId: "LA-002",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    gatNo: "Gat No. 142/1",
    ulpin: "MH-PUN-24-001421",
    village: "Wadgaon Sheri",
    taluka: "Haveli",
    district: "Pune",
    owner: "Baburao Shankarrao Shinde",
    areaTotalHa: 2.45,
    areaAcquiredHa: 1.20,
    classification: "Bagayat (Irrigated)",
    circleRate: 4850,
    status: "Cleared",
    polyPoints: "60,60 210,40 230,150 70,170",
    center: [140, 105],
  },
  {
    id: "p3",
    acquisitionId: "LA-003",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    gatNo: "Gat No. 142/2",
    ulpin: "MH-PUN-24-001422",
    village: "Wadgaon Sheri",
    taluka: "Haveli",
    district: "Pune",
    owner: "Kavita Eknath Gaikwad",
    areaTotalHa: 1.80,
    areaAcquiredHa: 1.80,
    classification: "Jirayat (Dry)",
    circleRate: 4850,
    status: "Pending",
    polyPoints: "210,40 370,30 390,140 230,150",
    center: [300, 90],
  },
  {
    id: "p4",
    acquisitionId: "LA-004",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    gatNo: "Gat No. 143/A",
    ulpin: "MH-PUN-24-001431",
    village: "Wadgaon Sheri",
    taluka: "Haveli",
    district: "Pune",
    owner: "Pandurang Vitthal More",
    areaTotalHa: 1.95,
    areaAcquiredHa: 0.95,
    classification: "Jirayat (Dry)",
    circleRate: 4850,
    status: "Cleared",
    polyPoints: "70,170 230,150 240,280 80,290",
    center: [155, 220],
  },
  {
    id: "p5",
    acquisitionId: "LA-005",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    gatNo: "Gat No. 144",
    ulpin: "MH-PUN-24-001440",
    village: "Wadgaon Sheri",
    taluka: "Haveli",
    district: "Pune",
    owner: "M/s Sahyadri Agro-Processing LLP",
    areaTotalHa: 4.50,
    areaAcquiredHa: 2.10,
    classification: "Non-Agricultural",
    circleRate: 7100,
    status: "Cleared",
    polyPoints: "230,150 390,140 410,270 240,280",
    center: [315, 210],
  },
  {
    id: "p6",
    acquisitionId: "LA-006",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    gatNo: "Gat No. 145/B",
    ulpin: "MH-PUN-24-001452",
    village: "Wadgaon Sheri",
    taluka: "Haveli",
    district: "Pune",
    owner: "Sunita Mahadev Patil & Co-heirs",
    areaTotalHa: 2.80,
    areaAcquiredHa: 2.80,
    classification: "Bagayat (Irrigated)",
    circleRate: 4850,
    status: "Disputed",
    polyPoints: "390,140 540,165 560,295 410,270",
    center: [475, 215],
  },

  /* MIDC - Nagpur */
  {
    id: "p7",
    acquisitionId: "LA-009",
    project: "Nagpur Industrial Corridor",
    authority: "MIDC",
    gatNo: "Gat No. 49/2",
    ulpin: "MH-WAR-24-33291",
    village: "Khamgaon",
    taluka: "Khamgaon",
    district: "Nagpur",
    owner: "Kisan Vikas Sahakari Mandali",
    areaTotalHa: 2.20,
    areaAcquiredHa: 1.40,
    classification: "Jirayat (Dry)",
    circleRate: 1800,
    status: "Pending",
    polyPoints: "50,310 200,300 210,420 60,430",
    center: [130, 360],
  },

  /* MIDC - Aurangabad */
  {
    id: "p8",
    acquisitionId: "LA-010",
    project: "Aurangabad Industrial Zone",
    authority: "MIDC",
    gatNo: "Gat No. 78/1",
    ulpin: "MH-AUR-24-078101",
    village: "Shendra",
    taluka: "Aurangabad",
    district: "Chhatrapati Sambhajinagar",
    owner: "Dattatraya B. Pawar",
    areaTotalHa: 3.50,
    areaAcquiredHa: 2.10,
    classification: "Jirayat (Dry)",
    circleRate: 2400,
    status: "Pending",
    polyPoints: "210,300 360,290 370,410 220,420",
    center: [290, 350],
  },

  /* GIDC - Sanand */
  {
    id: "p9",
    acquisitionId: "LA-013",
    project: "Sanand Industrial Expansion",
    authority: "GIDC",
    gatNo: "Survey No. 312/A",
    ulpin: "GJ-AHM-24-003121",
    village: "Nidharad",
    taluka: "Sanand",
    district: "Ahmedabad",
    owner: "Patel Harshadbhai Ranchhodbhai",
    areaTotalHa: 2.80,
    areaAcquiredHa: 1.90,
    classification: "Bagayat (Irrigated)",
    circleRate: 6400,
    status: "Cleared",
    polyPoints: "370,290 520,310 530,430 380,410",
    center: [450, 360],
  },

  /* GIDC - Dholera */
  {
    id: "p10",
    acquisitionId: "LA-016",
    project: "Dholera Industrial Development",
    authority: "GIDC",
    gatNo: "TP-2 Plot 104",
    ulpin: "GJ-DHO-24-000104",
    village: "Bhangadh",
    taluka: "Dholera",
    district: "Ahmedabad (SIR)",
    owner: "Gujarat Solar Fabtech Pvt Ltd",
    areaTotalHa: 5.60,
    areaAcquiredHa: 4.20,
    classification: "Non-Agricultural",
    circleRate: 8500,
    status: "Cleared",
    polyPoints: "530,310 680,300 690,420 540,430",
    center: [610, 360],
  },

  /* SIPCOT - Hosur */
  {
    id: "p11",
    acquisitionId: "LA-019",
    project: "Hosur Industrial Expansion",
    authority: "SIPCOT",
    gatNo: "SF No. 240/1",
    ulpin: "TN-KRI-24-024001",
    village: "Mookandapalli",
    taluka: "Hosur",
    district: "Krishnagiri",
    owner: "K. Venkateshappa & Sons",
    areaTotalHa: 3.20,
    areaAcquiredHa: 2.05,
    classification: "Bagayat (Irrigated)",
    circleRate: 5900,
    status: "Cleared",
    polyPoints: "60,450 210,440 220,560 70,570",
    center: [140, 505],
  },

  /* SIPCOT - Sriperumbudur */
  {
    id: "p12",
    acquisitionId: "LA-022",
    project: "Sriperumbudur Industrial Area",
    authority: "SIPCOT",
    gatNo: "Survey No. 89/1",
    ulpin: "TN-KAN-24-008901",
    village: "Mambakkam",
    taluka: "Sriperumbudur",
    district: "Kanchipuram",
    owner: "Annamalaiyar Agro Estates",
    areaTotalHa: 4.10,
    areaAcquiredHa: 3.80,
    classification: "Non-Agricultural",
    circleRate: 7800,
    status: "Cleared",
    polyPoints: "220,440 370,430 380,550 230,560",
    center: [300, 490],
  },

  /* RIICO - Jaipur */
  {
    id: "p13",
    acquisitionId: "LA-025",
    project: "Jaipur Industrial Area Expansion",
    authority: "RIICO",
    gatNo: "Khasra No. 512",
    ulpin: "RJ-JAI-24-000512",
    village: "Sitapura",
    taluka: "Sanganer",
    district: "Jaipur",
    owner: "Chaudhary Ramswaroop Meena",
    areaTotalHa: 2.60,
    areaAcquiredHa: 1.50,
    classification: "Jirayat (Dry)",
    circleRate: 4200,
    status: "Pending",
    polyPoints: "380,430 530,440 540,560 390,550",
    center: [460, 495],
  },

  /* RIICO - Neemrana */
  {
    id: "p14",
    acquisitionId: "LA-028",
    project: "Neemrana Industrial Zone",
    authority: "RIICO",
    gatNo: "Khasra No. 102/4",
    ulpin: "RJ-ALW-24-001024",
    village: "Majrakath",
    taluka: "Neemrana",
    district: "Kotputli-Behror",
    owner: "Rawat Industrial Logistics LLP",
    areaTotalHa: 3.80,
    areaAcquiredHa: 2.90,
    classification: "Non-Agricultural",
    circleRate: 5100,
    status: "Cleared",
    polyPoints: "540,440 690,430 700,550 550,560",
    center: [620, 490],
  },

  /* KIADB - Bengaluru */
  {
    id: "p15",
    acquisitionId: "LA-031",
    project: "Bengaluru Industrial Expansion",
    authority: "KIADB",
    gatNo: "Sy No. 18/1",
    ulpin: "KA-BLR-24-000018",
    village: "Channarayapatna",
    taluka: "Devanahalli",
    district: "Bengaluru Rural",
    owner: "Muniswamappa & Bros",
    areaTotalHa: 3.40,
    areaAcquiredHa: 2.30,
    classification: "Bagayat (Irrigated)",
    circleRate: 7400,
    status: "Disputed",
    polyPoints: "60,590 210,580 220,700 70,710",
    center: [140, 645],
  },

  /* KIADB - Dharwad */
  {
    id: "p16",
    acquisitionId: "LA-034",
    project: "Dharwad Industrial Area",
    authority: "KIADB",
    gatNo: "Sy No. 142/1",
    ulpin: "KA-DHA-24-000142",
    village: "Mummigatti",
    taluka: "Dharwad",
    district: "Dharwad",
    owner: "Basavaraj Shivappa Patil",
    areaTotalHa: 2.90,
    areaAcquiredHa: 1.75,
    classification: "Jirayat (Dry)",
    circleRate: 3800,
    status: "Cleared",
    polyPoints: "220,580 370,570 380,690 230,700",
    center: [300, 635],
  },
];

/* ── Gazetted Notifications ── */
export const notifications: NotificationRow[] = [
  { id: "1", acquisitionId: "LA-001", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", ulpin: "MH-PUN-24-001423", gatNo: "Gat No. 142/3A", areaHa: 1.65, district: "Pune", status: "Disputed", updated: "12 min ago", khatadar: "Ramesh Narayanrao Deshmukh", compensationCr: 2.62 },
  { id: "2", acquisitionId: "LA-002", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", ulpin: "MH-PUN-24-001421", gatNo: "Gat No. 142/1", areaHa: 1.20, district: "Pune", status: "Cleared", updated: "34 min ago", khatadar: "Baburao Shankarrao Shinde", compensationCr: 1.58 },
  { id: "3", acquisitionId: "LA-003", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", ulpin: "MH-PUN-24-001422", gatNo: "Gat No. 142/2", areaHa: 1.80, district: "Pune", status: "Pending", updated: "1 hr ago", khatadar: "Kavita Eknath Gaikwad", compensationCr: 2.12 },
  { id: "4", acquisitionId: "LA-004", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", ulpin: "MH-PUN-24-001431", gatNo: "Gat No. 143/A", areaHa: 0.95, district: "Pune", status: "Cleared", updated: "3 hr ago", khatadar: "Pandurang Vitthal More", compensationCr: 1.15 },
  { id: "5", acquisitionId: "LA-005", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", ulpin: "MH-PUN-24-001440", gatNo: "Gat No. 144", areaHa: 2.10, district: "Pune", status: "Cleared", updated: "5 hr ago", khatadar: "M/s Sahyadri Agro-Processing LLP", compensationCr: 3.76 },
  { id: "6", acquisitionId: "LA-006", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", ulpin: "MH-PUN-24-001452", gatNo: "Gat No. 145/B", areaHa: 2.80, district: "Pune", status: "Disputed", updated: "Yesterday", khatadar: "Sunita Mahadev Patil & Co-heirs", compensationCr: 2.85 },
  { id: "7", acquisitionId: "LA-009", project: "Nagpur Industrial Corridor", authority: "MIDC", ulpin: "MH-WAR-24-33291", gatNo: "Gat No. 49/2", areaHa: 1.40, district: "Nagpur", status: "Pending", updated: "3 days ago", khatadar: "Kisan Vikas Sahakari Mandali", compensationCr: 1.05 },
  { id: "8", acquisitionId: "LA-010", project: "Aurangabad Industrial Zone", authority: "MIDC", ulpin: "MH-AUR-24-078101", gatNo: "Gat No. 78/1", areaHa: 2.10, district: "Chhatrapati Sambhajinagar", status: "Pending", updated: "4 days ago", khatadar: "Dattatraya B. Pawar", compensationCr: 1.45 },
  { id: "9", acquisitionId: "LA-013", project: "Sanand Industrial Expansion", authority: "GIDC", ulpin: "GJ-AHM-24-003121", gatNo: "Survey No. 312/A", areaHa: 1.90, district: "Ahmedabad", status: "Cleared", updated: "6 hr ago", khatadar: "Patel Harshadbhai Ranchhodbhai", compensationCr: 3.40 },
  { id: "10", acquisitionId: "LA-016", project: "Dholera Industrial Development", authority: "GIDC", ulpin: "GJ-DHO-24-000104", gatNo: "TP-2 Plot 104", areaHa: 4.20, district: "Ahmedabad (SIR)", status: "Cleared", updated: "1 day ago", khatadar: "Gujarat Solar Fabtech Pvt Ltd", compensationCr: 7.85 },
  { id: "11", acquisitionId: "LA-019", project: "Hosur Industrial Expansion", authority: "SIPCOT", ulpin: "TN-KRI-24-024001", gatNo: "SF No. 240/1", areaHa: 2.05, district: "Krishnagiri", status: "Cleared", updated: "2 days ago", khatadar: "K. Venkateshappa & Sons", compensationCr: 2.95 },
  { id: "12", acquisitionId: "LA-022", project: "Sriperumbudur Industrial Area", authority: "SIPCOT", ulpin: "TN-KAN-24-008901", gatNo: "Survey No. 89/1", areaHa: 3.80, district: "Kanchipuram", status: "Cleared", updated: "2 days ago", khatadar: "Annamalaiyar Agro Estates", compensationCr: 5.40 },
  { id: "13", acquisitionId: "LA-025", project: "Jaipur Industrial Area Expansion", authority: "RIICO", ulpin: "RJ-JAI-24-000512", gatNo: "Khasra No. 512", areaHa: 1.50, district: "Jaipur", status: "Pending", updated: "5 days ago", khatadar: "Chaudhary Ramswaroop Meena", compensationCr: 1.75 },
  { id: "14", acquisitionId: "LA-028", project: "Neemrana Industrial Zone", authority: "RIICO", ulpin: "RJ-ALW-24-001024", gatNo: "Khasra No. 102/4", areaHa: 2.90, district: "Kotputli-Behror", status: "Cleared", updated: "1 day ago", khatadar: "Rawat Industrial Logistics LLP", compensationCr: 4.10 },
  { id: "15", acquisitionId: "LA-031", project: "Bengaluru Industrial Expansion", authority: "KIADB", ulpin: "KA-BLR-24-000018", gatNo: "Sy No. 18/1", areaHa: 2.30, district: "Bengaluru Rural", status: "Disputed", updated: "Yesterday", khatadar: "Muniswamappa & Bros", compensationCr: 4.65 },
  { id: "16", acquisitionId: "LA-034", project: "Dharwad Industrial Area", authority: "KIADB", ulpin: "KA-DHA-24-000142", gatNo: "Sy No. 142/1", areaHa: 1.75, district: "Dharwad", status: "Cleared", updated: "3 days ago", khatadar: "Basavaraj Shivappa Patil", compensationCr: 1.95 },
];

/* ── Social Impact Assessment (SIA) Reports ── */
export const initialSiaReports: SiaReport[] = [
  {
    id: "SIA-2024-041",
    acquisitionId: "LA-001",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    district: "Pune",
    agency: "Gokhale Institute of Politics & Economics, Pune",
    status: "Approved",
    families: 342,
    scStFamilies: 48,
    hearingDate: "14 Jul 2024",
    submitted: "14 Aug 2024",
    notifSec4Date: "02 Feb 2024",
    summary: "Comprehensive assessment concluded public interest outweighs displacement. Recommended 2.5x solatium and direct job reservations in automotive logistics hubs.",
  },
  {
    id: "SIA-2024-038",
    acquisitionId: "LA-002",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    district: "Pune",
    agency: "Tata Institute of Social Sciences (TISS), Mumbai",
    status: "Approved",
    families: 189,
    scStFamilies: 22,
    hearingDate: "28 Aug 2024",
    submitted: "02 Jul 2024",
    notifSec4Date: "15 Jan 2024",
    summary: "Evaluating alternative alignment to avoid 42 hectares of multi-crop agricultural land. Gram Sabha resolution ratified for Wadgaon Sheri sector.",
  },
  {
    id: "SIA-2024-036",
    acquisitionId: "LA-003",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    district: "Pune",
    agency: "Tata Institute of Social Sciences (TISS), Mumbai",
    status: "Under review",
    families: 114,
    scStFamilies: 16,
    hearingDate: "12 Oct 2024",
    submitted: "10 Aug 2024",
    notifSec4Date: "20 Mar 2024",
    summary: "Draft SIMP under review. Objection received regarding access road width for irrigation tracts.",
  },
  {
    id: "SIA-2024-029",
    acquisitionId: "LA-009",
    project: "Nagpur Industrial Corridor",
    authority: "MIDC",
    district: "Nagpur",
    agency: "Dr. Babasaheb Ambedkar Marathwada University",
    status: "Approved",
    families: 156,
    scStFamilies: 31,
    hearingDate: "04 May 2024",
    submitted: "22 May 2024",
    notifSec4Date: "08 Oct 2023",
    summary: "SIMP ratified by Collector. Zero residential displacement, primarily single-crop rainfed holdings.",
  },
  {
    id: "SIA-2024-051",
    acquisitionId: "LA-013",
    project: "Sanand Industrial Expansion",
    authority: "GIDC",
    district: "Ahmedabad",
    agency: "Centre for Environmental Planning & Technology (CEPT)",
    status: "Public hearing",
    families: 245,
    scStFamilies: 19,
    hearingDate: "18 Sep 2024",
    submitted: "04 Aug 2024",
    notifSec4Date: "12 Mar 2024",
    summary: "Public consultation held for Sanand Phase-III semiconductor supplier corridor. 94% farmers accepted cash compensation and skill vouchers.",
  },
  {
    id: "SIA-2024-055",
    acquisitionId: "LA-016",
    project: "Dholera Industrial Development",
    authority: "GIDC",
    district: "Ahmedabad (SIR)",
    agency: "Gujarat Institute of Development Research (GIDR)",
    status: "Approved",
    families: 480,
    scStFamilies: 62,
    hearingDate: "11 Jan 2024",
    submitted: "28 Feb 2024",
    notifSec4Date: "15 Sep 2023",
    summary: "Master town planning scheme TP-2 environmental & social clearance endorsed without statutory objections.",
  },
  {
    id: "SIA-2024-061",
    acquisitionId: "LA-019",
    project: "Hosur Industrial Expansion",
    authority: "SIPCOT",
    district: "Krishnagiri",
    agency: "Madras Institute of Development Studies (MIDS)",
    status: "Approved",
    families: 195,
    scStFamilies: 28,
    hearingDate: "05 Jun 2024",
    submitted: "20 Jun 2024",
    notifSec4Date: "10 Dec 2023",
    summary: "R&R package includes dedicated employment quota in electric two-wheeler assembly units.",
  },
  {
    id: "SIA-2024-068",
    acquisitionId: "LA-025",
    project: "Jaipur Industrial Area Expansion",
    authority: "RIICO",
    district: "Jaipur",
    agency: "Harish Chandra Mathur Rajasthan State Institute of Public Administration",
    status: "Public hearing",
    families: 172,
    scStFamilies: 35,
    hearingDate: "29 Sep 2024",
    submitted: "15 Jul 2024",
    notifSec4Date: "14 Feb 2024",
    summary: "Preliminary hearing scheduled for Sitapura south expansion. Water table impact mitigation under review.",
  },
  {
    id: "SIA-2024-072",
    acquisitionId: "LA-031",
    project: "Bengaluru Industrial Expansion",
    authority: "KIADB",
    district: "Bengaluru Rural",
    agency: "Institute for Social and Economic Change (ISEC), Bengaluru",
    status: "Under review",
    families: 310,
    scStFamilies: 44,
    hearingDate: "14 Oct 2024",
    submitted: "25 Aug 2024",
    notifSec4Date: "05 Apr 2024",
    summary: "Expert Appraisal Committee examining Section 28(1) representations regarding commercial horticulture orchards.",
  },
];

/* ── Valuation Records ── */
export const initialValuations: ValuationRecord[] = [
  { id: "VAL-1041", acquisitionId: "LA-001", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", parcel: "Gat No. 142/3A", village: "Wadgaon Sheri", taluka: "Haveli", district: "Pune", areaSqM: 16500, circleRate: 5200, multiplier: 1.5, assetsValue: 2400000, solatiumPct: 100, totalCr: 2.62, status: "Under Objection" },
  { id: "VAL-1038", acquisitionId: "LA-002", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", parcel: "Gat No. 142/1", village: "Wadgaon Sheri", taluka: "Haveli", district: "Pune", areaSqM: 12000, circleRate: 4850, multiplier: 1.5, assetsValue: 1200000, solatiumPct: 100, totalCr: 1.58, status: "Approved" },
  { id: "VAL-1035", acquisitionId: "LA-003", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", parcel: "Gat No. 142/2", village: "Wadgaon Sheri", taluka: "Haveli", district: "Pune", areaSqM: 18000, circleRate: 4850, multiplier: 1.5, assetsValue: 1500000, solatiumPct: 100, totalCr: 2.12, status: "Pending Review" },
  { id: "VAL-1034", acquisitionId: "LA-004", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", parcel: "Gat No. 143/A", village: "Wadgaon Sheri", taluka: "Haveli", district: "Pune", areaSqM: 9500, circleRate: 4850, multiplier: 1.5, assetsValue: 650000, solatiumPct: 100, totalCr: 1.15, status: "Approved" },
  { id: "VAL-1032", acquisitionId: "LA-005", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", parcel: "Gat No. 144", village: "Wadgaon Sheri", taluka: "Haveli", district: "Pune", areaSqM: 21000, circleRate: 7100, multiplier: 1.25, assetsValue: 1850000, solatiumPct: 100, totalCr: 3.76, status: "Approved" },
  { id: "VAL-1031", acquisitionId: "LA-006", project: "Pune–Chakan Industrial Expansion", authority: "MIDC", parcel: "Gat No. 145/B", village: "Wadgaon Sheri", taluka: "Haveli", district: "Pune", areaSqM: 28000, circleRate: 4850, multiplier: 1.5, assetsValue: 2100000, solatiumPct: 100, totalCr: 2.85, status: "Under Objection" },
  { id: "VAL-1029", acquisitionId: "LA-009", project: "Nagpur Industrial Corridor", authority: "MIDC", parcel: "Gat No. 49/2", village: "Khamgaon", taluka: "Khamgaon", district: "Nagpur", areaSqM: 14000, circleRate: 1800, multiplier: 2.0, assetsValue: 850000, solatiumPct: 100, totalCr: 1.05, status: "Approved" },
  { id: "VAL-2013", acquisitionId: "LA-013", project: "Sanand Industrial Expansion", authority: "GIDC", parcel: "Survey No. 312/A", village: "Nidharad", taluka: "Sanand", district: "Ahmedabad", areaSqM: 19000, circleRate: 6400, multiplier: 1.25, assetsValue: 1800000, solatiumPct: 100, totalCr: 3.40, status: "Approved" },
  { id: "VAL-2016", acquisitionId: "LA-016", project: "Dholera Industrial Development", authority: "GIDC", parcel: "TP-2 Plot 104", village: "Bhangadh", taluka: "Dholera", district: "Ahmedabad (SIR)", areaSqM: 42000, circleRate: 8500, multiplier: 1.0, assetsValue: 3500000, solatiumPct: 100, totalCr: 7.85, status: "Approved" },
  { id: "VAL-3019", acquisitionId: "LA-019", project: "Hosur Industrial Expansion", authority: "SIPCOT", parcel: "SF No. 240/1", village: "Mookandapalli", taluka: "Hosur", district: "Krishnagiri", areaSqM: 20500, circleRate: 5900, multiplier: 1.15, assetsValue: 1600000, solatiumPct: 100, totalCr: 2.95, status: "Approved" },
  { id: "VAL-3022", acquisitionId: "LA-022", project: "Sriperumbudur Industrial Area", authority: "SIPCOT", parcel: "Survey No. 89/1", village: "Mambakkam", taluka: "Sriperumbudur", district: "Kanchipuram", areaSqM: 38000, circleRate: 7800, multiplier: 1.0, assetsValue: 2200000, solatiumPct: 100, totalCr: 5.40, status: "Approved" },
  { id: "VAL-4025", acquisitionId: "LA-025", project: "Jaipur Industrial Area Expansion", authority: "RIICO", parcel: "Khasra No. 512", village: "Sitapura", taluka: "Sanganer", district: "Jaipur", areaSqM: 15000, circleRate: 4200, multiplier: 1.35, assetsValue: 950000, solatiumPct: 100, totalCr: 1.75, status: "Pending Review" },
  { id: "VAL-4028", acquisitionId: "LA-028", project: "Neemrana Industrial Zone", authority: "RIICO", parcel: "Khasra No. 102/4", village: "Majrakath", taluka: "Neemrana", district: "Kotputli-Behror", areaSqM: 29000, circleRate: 5100, multiplier: 1.25, assetsValue: 1900000, solatiumPct: 100, totalCr: 4.10, status: "Approved" },
  { id: "VAL-5031", acquisitionId: "LA-031", project: "Bengaluru Industrial Expansion", authority: "KIADB", parcel: "Sy No. 18/1", village: "Channarayapatna", taluka: "Devanahalli", district: "Bengaluru Rural", areaSqM: 23000, circleRate: 7400, multiplier: 1.25, assetsValue: 2800000, solatiumPct: 100, totalCr: 4.65, status: "Under Objection" },
  { id: "VAL-5034", acquisitionId: "LA-034", project: "Dharwad Industrial Area", authority: "KIADB", parcel: "Sy No. 142/1", village: "Mummigatti", taluka: "Dharwad", district: "Dharwad", areaSqM: 17500, circleRate: 3800, multiplier: 1.4, assetsValue: 1200000, solatiumPct: 100, totalCr: 1.95, status: "Approved" },
];

/* ── Litigation Records ── */
export const initialLitigations: LitigationCase[] = [
  {
    caseNo: "WP/2024/1847",
    acquisitionId: "LA-001",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    petitioner: "Ramesh Narayanrao Deshmukh & Ors.",
    respondent: "State of Maharashtra & MIDC",
    court: "Bombay HC",
    type: "Sec 26 Valuation Challenge",
    status: "Hearing",
    nextDate: "18 Sep 2024",
    daysRemaining: 4,
    counsel: "Adv. S.V. Deshpande, AGP",
    reliefClaimed: "Demands market rate based on 2024 Ready Reckoner plus 100% solatium calculation correction.",
  },
  {
    caseNo: "LARRA/PUN/24/092",
    acquisitionId: "LA-006",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    petitioner: "Sunita Mahadev Patil & Co-heirs",
    respondent: "Special Land Acquisition Officer (SLAO), Pune",
    court: "RCTLARR Authority",
    type: "Section 64 Reference",
    status: "Pending orders",
    nextDate: "22 Sep 2024",
    daysRemaining: 8,
    counsel: "Adv. K.R. Kulkarni",
    reliefClaimed: "Contests joint measurement survey claiming 0.45 Ha excess acquired without notice under Section 21.",
  },
  {
    caseNo: "LARRA/NAG/24/114",
    acquisitionId: "LA-009",
    project: "Nagpur Industrial Corridor",
    authority: "MIDC",
    petitioner: "Kisan Vikas Sahakari Mandali",
    respondent: "District Collector, Buldhana",
    court: "RCTLARR Authority",
    type: "Rehabilitation Package (Sec 16)",
    status: "Hearing",
    nextDate: "11 Oct 2024",
    daysRemaining: 27,
    counsel: "Adv. A.G. Joshi",
    reliefClaimed: "Enforcement of agricultural tubewell compensation under Section 29 award schedule.",
  },
  {
    caseNo: "SCA/2024/4912",
    acquisitionId: "LA-013",
    project: "Sanand Industrial Expansion",
    authority: "GIDC",
    petitioner: "Nidharad Gram Samiti & Ors.",
    respondent: "GIDC & Collector Ahmedabad",
    court: "Gujarat HC",
    type: "Gauchar (Pasture) Land Allocation",
    status: "Hearing",
    nextDate: "25 Sep 2024",
    daysRemaining: 11,
    counsel: "Adv. B. M. Trivedi",
    reliefClaimed: "Requires equivalent village grazing land allotment under Gujarat Land Revenue Rules before handover.",
  },
  {
    caseNo: "WP(MD)/2024/3104",
    acquisitionId: "LA-019",
    project: "Hosur Industrial Expansion",
    authority: "SIPCOT",
    petitioner: "Krishnagiri Farmers Welfare Association",
    respondent: "SIPCOT & DRO Krishnagiri",
    court: "Madras HC",
    type: "Tree & Crop Valuation Enhancement",
    status: "Evidence stage",
    nextDate: "03 Oct 2024",
    daysRemaining: 19,
    counsel: "Adv. R. Murugan",
    reliefClaimed: "Revaluation of 420 coconut trees as per Horticulture Department schedule of rates.",
  },
  {
    caseNo: "DB-CWP/2024/1429",
    acquisitionId: "LA-025",
    project: "Jaipur Industrial Area Expansion",
    authority: "RIICO",
    petitioner: "Sitapura Khatedar Union",
    respondent: "RIICO & Special Collector LA",
    court: "Rajasthan HC",
    type: "Section 15 Hearing Irregularity",
    status: "Interim stay",
    nextDate: "28 Sep 2024",
    daysRemaining: 14,
    counsel: "Adv. Jitendra S. Bhati",
    reliefClaimed: "Interim stay on issuance of Section 19 declaration pending rehearing of environmental objections.",
  },
  {
    caseNo: "WP/2024/8892",
    acquisitionId: "LA-031",
    project: "Bengaluru Industrial Expansion",
    authority: "KIADB",
    petitioner: "Muniswamappa & 6 Others",
    respondent: "KIADB & CLAO Bengaluru",
    court: "Karnataka HC",
    type: "Section 28(4) Quashing Petition",
    status: "Interim stay",
    nextDate: "30 Sep 2024",
    daysRemaining: 16,
    counsel: "Adv. S. N. Hegde",
    reliefClaimed: "Stay on physical dispossession granted pending joint inspection by survey superintendent.",
  },
];

/* ── Compensation Records ── */
export const initialCompensations: Record<string, CompensationRecord> = {
  "LA-001": {
    acquisitionId: "LA-001",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    totalCr: 2.62,
    disbursedCr: 0.00,
    mode: "State Escrow (Sec 26 dispute)",
    status: "Disputed",
    dbtRef: "ESC-MH-2024-8841",
    bankAccountLinked: true,
    notes: "Compensation deposited into SLAO Revenue Escrow account pending Bombay HC WP/2024/1847 adjudication.",
  },
  "LA-002": {
    acquisitionId: "LA-002",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    totalCr: 1.58,
    disbursedCr: 1.58,
    mode: "PFMS Direct Benefit Transfer (DBT)",
    status: "Cleared",
    dbtRef: "PFMS-DBT-2024-9104",
    bankAccountLinked: true,
    notes: "100% statutory award credited directly to verified Aadhaar-seeded SBI account.",
  },
  "LA-003": {
    acquisitionId: "LA-003",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    totalCr: 2.12,
    disbursedCr: 0.00,
    mode: "Pending Section 23 Inquiry",
    status: "Pending",
    dbtRef: "PEN-REV-2024-0042",
    bankAccountLinked: true,
    notes: "Award estimation prepared. Awaiting final joint measurement sign-off and Gram Sabha clearance.",
  },
  "LA-004": {
    acquisitionId: "LA-004",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    totalCr: 1.15,
    disbursedCr: 1.15,
    mode: "PFMS Direct Benefit Transfer (DBT)",
    status: "Cleared",
    dbtRef: "PFMS-DBT-2024-8832",
    bankAccountLinked: true,
    notes: "Award payment settled under Section 31 statutory notification.",
  },
  "LA-005": {
    acquisitionId: "LA-005",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    totalCr: 3.76,
    disbursedCr: 3.76,
    mode: "Commercial RTGS Settlement",
    status: "Cleared",
    dbtRef: "RTGS-MH-2024-5541",
    bankAccountLinked: true,
    notes: "Consent award executed under mutual deed with M/s Sahyadri Agro-Processing LLP.",
  },
  "LA-006": {
    acquisitionId: "LA-006",
    project: "Pune–Chakan Industrial Expansion",
    authority: "MIDC",
    totalCr: 2.85,
    disbursedCr: 0.00,
    mode: "State Escrow Account",
    status: "Disputed",
    dbtRef: "ESC-MH-2024-9923",
    bankAccountLinked: false,
    notes: "Disbursement frozen under Section 64 reference notice by co-heirs.",
  },
  "LA-009": {
    acquisitionId: "LA-009",
    project: "Nagpur Industrial Corridor",
    authority: "MIDC",
    totalCr: 1.05,
    disbursedCr: 0.00,
    mode: "LARRA Dispute Escrow",
    status: "Pending",
    dbtRef: "LARRA-NAG-2024-114",
    bankAccountLinked: true,
    notes: "Tubewell enhancement valuation pending before LARRA Authority.",
  },
  "LA-010": {
    acquisitionId: "LA-010",
    project: "Aurangabad Industrial Zone",
    authority: "MIDC",
    totalCr: 1.45,
    disbursedCr: 0.00,
    mode: "Preliminary Valuation Escrow",
    status: "Pending",
    dbtRef: "PEN-AUR-2024-0010",
    bankAccountLinked: true,
    notes: "Award estimates prepared under Section 11 notice.",
  },
  "LA-013": {
    acquisitionId: "LA-013",
    project: "Sanand Industrial Expansion",
    authority: "GIDC",
    totalCr: 3.40,
    disbursedCr: 3.40,
    mode: "GIDC e-Payment PFMS",
    status: "Cleared",
    dbtRef: "PFMS-GJ-2024-3312",
    bankAccountLinked: true,
    notes: "Settled directly via e-Gram DBT gateway.",
  },
  "LA-016": {
    acquisitionId: "LA-016",
    project: "Dholera Industrial Development",
    authority: "GIDC",
    totalCr: 7.85,
    disbursedCr: 7.85,
    mode: "Dholera SIR Fast-Track DBT",
    status: "Cleared",
    dbtRef: "PFMS-GJ-2024-9041",
    bankAccountLinked: true,
    notes: "100% consent award cleared under Fast-Track SIR mandate.",
  },
  "LA-019": {
    acquisitionId: "LA-019",
    project: "Hosur Industrial Expansion",
    authority: "SIPCOT",
    totalCr: 2.95,
    disbursedCr: 2.95,
    mode: "SIPCOT DBT Treasury",
    status: "Cleared",
    dbtRef: "PFMS-TN-2024-4421",
    bankAccountLinked: true,
    notes: "Electronic disbursement credited to Indian Bank account.",
  },
  "LA-022": {
    acquisitionId: "LA-022",
    project: "Sriperumbudur Industrial Area",
    authority: "SIPCOT",
    totalCr: 5.40,
    disbursedCr: 5.40,
    mode: "SIPCOT DBT Treasury",
    status: "Cleared",
    dbtRef: "PFMS-TN-2024-7819",
    bankAccountLinked: true,
    notes: "Final possession award disbursed in full.",
  },
  "LA-025": {
    acquisitionId: "LA-025",
    project: "Jaipur Industrial Area Expansion",
    authority: "RIICO",
    totalCr: 1.75,
    disbursedCr: 0.00,
    mode: "High Court Injunction Hold",
    status: "Disputed",
    dbtRef: "STAY-RJ-2024-1429",
    bankAccountLinked: true,
    notes: "Held in treasury escrow pending Rajasthan HC DB-CWP/2024/1429 disposal.",
  },
  "LA-028": {
    acquisitionId: "LA-028",
    project: "Neemrana Industrial Zone",
    authority: "RIICO",
    totalCr: 4.10,
    disbursedCr: 4.10,
    mode: "RIICO Direct DBT",
    status: "Cleared",
    dbtRef: "PFMS-RJ-2024-5512",
    bankAccountLinked: true,
    notes: "100% award payment completed under Japanese Zone Phase-IV plan.",
  },
  "LA-031": {
    acquisitionId: "LA-031",
    project: "Bengaluru Industrial Expansion",
    authority: "KIADB",
    totalCr: 4.65,
    disbursedCr: 0.00,
    mode: "High Court Injunction Escrow",
    status: "Disputed",
    dbtRef: "STAY-KA-2024-8892",
    bankAccountLinked: true,
    notes: "Held in KIADB revenue account pending Karnataka HC WP/2024/8892.",
  },
  "LA-034": {
    acquisitionId: "LA-034",
    project: "Dharwad Industrial Area",
    authority: "KIADB",
    totalCr: 1.95,
    disbursedCr: 1.95,
    mode: "KIADB e-Khata DBT",
    status: "Cleared",
    dbtRef: "PFMS-KA-2024-6632",
    bankAccountLinked: true,
    notes: "Award payment disbursed to Canara Bank verified account.",
  },
};

/* ── Unified Cross-Module Dossier Resolution Helper ── */
export function getUnifiedAcquisition(acquisitionId: string) {
  const parcel = cadastralParcels.find((p) => p.acquisitionId === acquisitionId);
  const notification = notifications.find((n) => n.acquisitionId === acquisitionId);
  const sia = initialSiaReports.find((s) => s.acquisitionId === acquisitionId);
  const valuation = initialValuations.find((v) => v.acquisitionId === acquisitionId);
  const litigation = initialLitigations.find((l) => l.acquisitionId === acquisitionId);
  const compensation = initialCompensations[acquisitionId] || {
    acquisitionId,
    project: parcel?.project || notification?.project || "Pune–Chakan Industrial Expansion",
    authority: parcel?.authority || notification?.authority || "MIDC",
    totalCr: valuation?.totalCr || notification?.compensationCr || 2.5,
    disbursedCr: (parcel?.status === "Cleared" || notification?.status === "Cleared") ? (valuation?.totalCr || notification?.compensationCr || 2.5) : 0,
    mode: (parcel?.status === "Cleared" || notification?.status === "Cleared") ? "PFMS Direct Benefit Transfer (DBT)" : (litigation ? "State Escrow Account" : "Pending Statutory Inquiry"),
    status: parcel?.status || notification?.status || (litigation ? "Disputed" : "Pending"),
    dbtRef: `PFMS-GOV-2024-${acquisitionId.replace("LA-", "")}`,
    bankAccountLinked: true,
    notes: `Acquisition file processed for ${parcel?.gatNo || notification?.gatNo || acquisitionId}.`,
  };

  const project = notification?.project || parcel?.project || sia?.project || litigation?.project || "Pune–Chakan Industrial Expansion";
  const authority = notification?.authority || parcel?.authority || sia?.authority || litigation?.authority || "MIDC";
  const gatNo = parcel?.gatNo || notification?.gatNo || valuation?.parcel || "Survey Parcel";
  const ulpin = parcel?.ulpin || notification?.ulpin || "MH-PUN-24-000000";
  const owner = parcel?.owner || notification?.khatadar || "Recorded Title Holder";
  const areaTotalHa = parcel?.areaTotalHa || (notification ? notification.areaHa * 1.5 : 2.0);
  const areaAcquiredHa = parcel?.areaAcquiredHa || notification?.areaHa || 1.0;
  const status: Status = parcel?.status || notification?.status || (litigation ? "Disputed" : "Pending");

  return {
    acquisitionId,
    project,
    authority,
    gatNo,
    ulpin,
    owner,
    areaTotalHa,
    areaAcquiredHa,
    status,
    parcel,
    notification,
    sia,
    valuation,
    compensation,
    litigation,
  };
}
