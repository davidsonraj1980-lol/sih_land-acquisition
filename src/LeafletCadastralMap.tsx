import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { Status, AuthorityCode } from "./portalData";

export interface CadastralFeature {
  id: string;
  acquisitionId: string;
  gatNo: string;
  ulpin: string; // 14-digit Bhu-Aadhaar
  owner: string;
  authority: AuthorityCode;
  district: string;
  taluka: string;
  village: string;
  areaHa: number;
  areaGuntha: number; // 1 Ha = 40 Guntha
  landClass: "Bagayat (Irrigated)" | "Jirayat (Dry crop)" | "Padit (Fallow)" | "Gairan (Pasture)";
  circleRatePerSqM: number;
  marketValueCr: number;
  solatiumCr: number;
  totalAwardCr: number;
  status: Status;
  disputeNote?: string;
  coordinates: [number, number][]; // Polygon vertices [lat, lng]
  center: [number, number];
}

// Security sanitizer to prevent HTML injection (XSS) in Leaflet tooltips
function escapeHtml(str: string | number): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Statutory Cadastral GeoJSON Data conforming to Indian Survey Numbers ──
// Strictly aligned along the real road alignment corridors
export const statutoryCadastralParcels: CadastralFeature[] = [
  // ── Pune Haveli / Chakan Link (NH 60 Highway Alignment) ──
  {
    id: "PAR-PUN-01",
    acquisitionId: "LA-001",
    gatNo: "Gat No. 142/3A",
    ulpin: "MH-PUN-2024-8841",
    owner: "Kashinath D. Patil & 2 Others",
    authority: "MIDC",
    district: "Pune",
    taluka: "Haveli",
    village: "Wadgaon Sheri (Chakan)",
    areaHa: 4.85,
    areaGuntha: 194,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 4850,
    marketValueCr: 3.53,
    solatiumCr: 3.53,
    totalAwardCr: 7.06,
    status: "Cleared",
    coordinates: [
      [18.7540, 73.8568],
      [18.7568, 73.8563],
      [18.7568, 73.8601],
      [18.7540, 73.8606],
    ],
    center: [18.7554, 73.8584],
  },
  {
    id: "PAR-PUN-02",
    acquisitionId: "LA-002",
    gatNo: "Gat No. 88/2",
    ulpin: "MH-PUN-2024-9102",
    owner: "Suresh Baburao Shinde & Legal Heirs",
    authority: "MIDC",
    district: "Pune",
    taluka: "Haveli",
    village: "Wadgaon Sheri (Chakan)",
    areaHa: 3.20,
    areaGuntha: 128,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 4200,
    marketValueCr: 2.02,
    solatiumCr: 2.02,
    totalAwardCr: 4.04,
    status: "Disputed",
    disputeNote: "Bombay HC Stay WP 4102/2024 (Section 26 Rural Multiplier Challenge)",
    coordinates: [
      [18.7568, 73.8563],
      [18.7596, 73.8558],
      [18.7596, 73.8596],
      [18.7568, 73.8601],
    ],
    center: [18.7582, 73.8579],
  },
  {
    id: "PAR-PUN-03",
    acquisitionId: "LA-003",
    gatNo: "Gat No. 89/1",
    ulpin: "MH-PUN-2024-9103",
    owner: "Ganesh Maruti Bhosale",
    authority: "MIDC",
    district: "Pune",
    taluka: "Haveli",
    village: "Wadgaon Sheri (Chakan)",
    areaHa: 3.80,
    areaGuntha: 152,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 4200,
    marketValueCr: 2.39,
    solatiumCr: 2.39,
    totalAwardCr: 4.78,
    status: "Pending",
    disputeNote: "Section 15 Gram Sabha objection hearing scheduled 28th Sept",
    coordinates: [
      [18.7596, 73.8558],
      [18.7626, 73.8552],
      [18.7626, 73.8590],
      [18.7596, 73.8596],
    ],
    center: [18.7611, 73.8574],
  },
  {
    id: "PAR-PUN-04",
    acquisitionId: "LA-001",
    gatNo: "Gat No. 144/1",
    ulpin: "MH-PUN-2024-8842",
    owner: "Pandurang Tukaram Jagtap",
    authority: "MIDC",
    district: "Pune",
    taluka: "Haveli",
    village: "Wadgaon Sheri (Chakan)",
    areaHa: 2.75,
    areaGuntha: 110,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 4850,
    marketValueCr: 2.00,
    solatiumCr: 2.00,
    totalAwardCr: 4.00,
    status: "Pending",
    disputeNote: "Section 19(7) notification pending final Form XI Award declaration",
    coordinates: [
      [18.7540, 73.8608],
      [18.7568, 73.8603],
      [18.7568, 73.8640],
      [18.7540, 73.8645],
    ],
    center: [18.7554, 73.8624],
  },
  {
    id: "PAR-PUN-05",
    acquisitionId: "LA-001",
    gatNo: "Gat No. 145/B",
    ulpin: "MH-PUN-2024-8843",
    owner: "Anusuya Ramdas Gaikwad",
    authority: "MIDC",
    district: "Pune",
    taluka: "Haveli",
    village: "Wadgaon Sheri (Chakan)",
    areaHa: 5.40,
    areaGuntha: 216,
    landClass: "Padit (Fallow)",
    circleRatePerSqM: 3900,
    marketValueCr: 3.16,
    solatiumCr: 3.16,
    totalAwardCr: 6.32,
    status: "Cleared",
    coordinates: [
      [18.7568, 73.8603],
      [18.7596, 73.8598],
      [18.7596, 73.8635],
      [18.7568, 73.8640],
    ],
    center: [18.7582, 73.8619],
  },
  {
    id: "PAR-PUN-06",
    acquisitionId: "LA-001",
    gatNo: "Gat No. 146/A",
    ulpin: "MH-PUN-2024-8844",
    owner: "Sanjay Dnyaneshwar Landge",
    authority: "MIDC",
    district: "Pune",
    taluka: "Haveli",
    village: "Wadgaon Sheri (Chakan)",
    areaHa: 4.10,
    areaGuntha: 164,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 4850,
    marketValueCr: 2.98,
    solatiumCr: 2.98,
    totalAwardCr: 5.96,
    status: "Cleared",
    coordinates: [
      [18.7596, 73.8598],
      [18.7626, 73.8592],
      [18.7626, 73.8629],
      [18.7596, 73.8635],
    ],
    center: [18.7611, 73.8613],
  },

  // ── Karnataka KIADB Aerospace corridor parcels (Devanahalli) ──
  {
    id: "PAR-KAR-01",
    acquisitionId: "LA-010",
    gatNo: "Survey No. 54/1",
    ulpin: "KA-BLR-2024-1002",
    owner: "M. Nanjundappa & Bros",
    authority: "KIADB",
    district: "Bengaluru Rural",
    taluka: "Devanahalli",
    village: "Bidaluru (Aerospace Park)",
    areaHa: 4.20,
    areaGuntha: 168,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 6200,
    marketValueCr: 3.91,
    solatiumCr: 3.91,
    totalAwardCr: 7.82,
    status: "Cleared",
    coordinates: [
      [13.1950, 77.7042],
      [13.1978, 77.7058],
      [13.1978, 77.7077],
      [13.1950, 77.7061],
    ],
    center: [13.1964, 77.7059],
  },
  {
    id: "PAR-KAR-02",
    acquisitionId: "LA-010",
    gatNo: "Survey No. 55/2",
    ulpin: "KA-BLR-2024-1003",
    owner: "V. Muniyappa & Co-sharers",
    authority: "KIADB",
    district: "Bengaluru Rural",
    taluka: "Devanahalli",
    village: "Bidaluru (Aerospace Park)",
    areaHa: 2.80,
    areaGuntha: 112,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 5800,
    marketValueCr: 2.44,
    solatiumCr: 2.44,
    totalAwardCr: 4.88,
    status: "Disputed",
    disputeNote: "Partition suit OS 189/2024 pending in Senior Civil Judge Court Devanahalli",
    coordinates: [
      [13.1978, 77.7058],
      [13.2008, 77.7075],
      [13.2008, 77.7094],
      [13.1978, 77.7077],
    ],
    center: [13.1993, 77.7076],
  },
  {
    id: "PAR-KAR-03",
    acquisitionId: "LA-010",
    gatNo: "Survey No. 56/1",
    ulpin: "KA-BLR-2024-1004",
    owner: "Ramakrishnaiah & Sons",
    authority: "KIADB",
    district: "Bengaluru Rural",
    taluka: "Devanahalli",
    village: "Bidaluru (Aerospace Park)",
    areaHa: 3.50,
    areaGuntha: 140,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 6200,
    marketValueCr: 3.25,
    solatiumCr: 3.25,
    totalAwardCr: 6.50,
    status: "Pending",
    disputeNote: "Section 28(2) notice issued, title verification underway",
    coordinates: [
      [13.2008, 77.7075],
      [13.2036, 77.7091],
      [13.2036, 77.7110],
      [13.2008, 77.7094],
    ],
    center: [13.2022, 77.7092],
  },
  {
    id: "PAR-KAR-04",
    acquisitionId: "LA-010",
    gatNo: "Survey No. 57/3",
    ulpin: "KA-BLR-2024-1005",
    owner: "C. Venkataswamy",
    authority: "KIADB",
    district: "Bengaluru Rural",
    taluka: "Devanahalli",
    village: "Bidaluru (Aerospace Park)",
    areaHa: 3.90,
    areaGuntha: 156,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 6200,
    marketValueCr: 3.63,
    solatiumCr: 3.63,
    totalAwardCr: 7.26,
    status: "Cleared",
    coordinates: [
      [13.1950, 77.7063],
      [13.1978, 77.7080],
      [13.1978, 77.7100],
      [13.1950, 77.7083],
    ],
    center: [13.1964, 77.7081],
  },
  {
    id: "PAR-KAR-05",
    acquisitionId: "LA-010",
    gatNo: "Survey No. 58/2",
    ulpin: "KA-BLR-2024-1006",
    owner: "Devanahalli Aerospace Farmers Trust",
    authority: "KIADB",
    district: "Bengaluru Rural",
    taluka: "Devanahalli",
    village: "Bidaluru (Aerospace Park)",
    areaHa: 4.60,
    areaGuntha: 184,
    landClass: "Padit (Fallow)",
    circleRatePerSqM: 5800,
    marketValueCr: 4.00,
    solatiumCr: 4.00,
    totalAwardCr: 8.00,
    status: "Cleared",
    coordinates: [
      [13.1978, 77.7080],
      [13.2008, 77.7097],
      [13.2008, 77.7117],
      [13.1978, 77.7100],
    ],
    center: [13.1993, 77.7098],
  },

  // ── Gujarat GIDC Dholera SIR Expressway corridor parcels (Ahmedabad) ──
  {
    id: "PAR-GUJ-01",
    acquisitionId: "LA-004",
    gatNo: "Khata No. 204/1",
    ulpin: "GJ-AHM-2024-4101",
    owner: "Karsanbhai Raghavbhai Patel & Co-owners",
    authority: "GIDC",
    district: "Ahmedabad",
    taluka: "Dholera",
    village: "Bavaliari (SIR Activation Zone)",
    areaHa: 4.50,
    areaGuntha: 180,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 5400,
    marketValueCr: 3.65,
    solatiumCr: 3.65,
    totalAwardCr: 7.30,
    status: "Cleared",
    coordinates: [
      [22.2475, 72.1820],
      [22.2505, 72.1815],
      [22.2505, 72.1855],
      [22.2475, 72.1860],
    ],
    center: [22.2490, 72.1838],
  },
  {
    id: "PAR-GUJ-02",
    acquisitionId: "LA-004",
    gatNo: "Survey No. 205/2",
    ulpin: "GJ-AHM-2024-4102",
    owner: "Bhikhabhai Somabhai Gohil",
    authority: "GIDC",
    district: "Ahmedabad",
    taluka: "Dholera",
    village: "Bavaliari (SIR Activation Zone)",
    areaHa: 3.10,
    areaGuntha: 124,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 4800,
    marketValueCr: 2.23,
    solatiumCr: 2.23,
    totalAwardCr: 4.46,
    status: "Disputed",
    disputeNote: "Gujarat HC SCA 9021/2024 (Section 26 Valuation Rate Challenge)",
    coordinates: [
      [22.2505, 72.1815],
      [22.2535, 72.1810],
      [22.2535, 72.1850],
      [22.2505, 72.1855],
    ],
    center: [22.2520, 72.1833],
  },
  {
    id: "PAR-GUJ-03",
    acquisitionId: "LA-005",
    gatNo: "Survey No. 206/1A",
    ulpin: "GJ-AHM-2024-4103",
    owner: "Pravinbhai K. Solanki",
    authority: "GIDC",
    district: "Ahmedabad",
    taluka: "Dholera",
    village: "Bavaliari (SIR Activation Zone)",
    areaHa: 3.80,
    areaGuntha: 152,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 4800,
    marketValueCr: 2.74,
    solatiumCr: 2.74,
    totalAwardCr: 5.48,
    status: "Pending",
    disputeNote: "Section 15 Gram Sabha hearing report under compilation by Collector",
    coordinates: [
      [22.2535, 72.1810],
      [22.2565, 72.1805],
      [22.2565, 72.1845],
      [22.2535, 72.1850],
    ],
    center: [22.2550, 72.1828],
  },
  {
    id: "PAR-GUJ-04",
    acquisitionId: "LA-005",
    gatNo: "Survey No. 207/3",
    ulpin: "GJ-AHM-2024-4104",
    owner: "Dholera Agro Farmers Producer Co.",
    authority: "GIDC",
    district: "Ahmedabad",
    taluka: "Dholera",
    village: "Bavaliari (SIR Activation Zone)",
    areaHa: 5.20,
    areaGuntha: 208,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 5400,
    marketValueCr: 4.21,
    solatiumCr: 4.21,
    totalAwardCr: 8.42,
    status: "Cleared",
    coordinates: [
      [22.2475, 72.1862],
      [22.2505, 72.1857],
      [22.2505, 72.1895],
      [22.2475, 72.1900],
    ],
    center: [22.2490, 72.1878],
  },
  {
    id: "PAR-GUJ-05",
    acquisitionId: "LA-004",
    gatNo: "Survey No. 208/1B",
    ulpin: "GJ-AHM-2024-4105",
    owner: "Manilal Devjibhai Vankar",
    authority: "GIDC",
    district: "Ahmedabad",
    taluka: "Dholera",
    village: "Bavaliari (SIR Activation Zone)",
    areaHa: 3.60,
    areaGuntha: 144,
    landClass: "Padit (Fallow)",
    circleRatePerSqM: 4500,
    marketValueCr: 2.43,
    solatiumCr: 2.43,
    totalAwardCr: 4.86,
    status: "Cleared",
    coordinates: [
      [22.2505, 72.1857],
      [22.2535, 72.1852],
      [22.2535, 72.1890],
      [22.2505, 72.1895],
    ],
    center: [22.2520, 72.1873],
  },

  // ── Tamil Nadu SIPCOT Sriperumbudur Electronics Corridor parcels (Kanchipuram) ──
  {
    id: "PAR-TN-01",
    acquisitionId: "LA-006",
    gatNo: "Survey No. 112/2A",
    ulpin: "TN-KCH-2024-7701",
    owner: "S. Murugan & Muthulakshmi Ammal",
    authority: "SIPCOT",
    district: "Kanchipuram",
    taluka: "Sriperumbudur",
    village: "Mambakkam (Electronics Corridor)",
    areaHa: 3.60,
    areaGuntha: 144,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 6800,
    marketValueCr: 3.67,
    solatiumCr: 3.67,
    totalAwardCr: 7.34,
    status: "Cleared",
    coordinates: [
      [12.9650, 79.9420],
      [12.9680, 79.9438],
      [12.9680, 79.9470],
      [12.9650, 79.9452],
    ],
    center: [12.9665, 79.9445],
  },
  {
    id: "PAR-TN-02",
    acquisitionId: "LA-006",
    gatNo: "Survey No. 113/1B",
    ulpin: "TN-KCH-2024-7702",
    owner: "K. Ranganathan & Brothers",
    authority: "SIPCOT",
    district: "Kanchipuram",
    taluka: "Sriperumbudur",
    village: "Mambakkam (Electronics Corridor)",
    areaHa: 2.70,
    areaGuntha: 108,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 6200,
    marketValueCr: 2.51,
    solatiumCr: 2.51,
    totalAwardCr: 5.02,
    status: "Disputed",
    disputeNote: "Madras HC WP 18234/2024 (Section 28 Multiplier factor in peri-urban Chennai challenge)",
    coordinates: [
      [12.9680, 79.9438],
      [12.9710, 79.9455],
      [12.9710, 79.9487],
      [12.9680, 79.9470],
    ],
    center: [12.9695, 79.9462],
  },
  {
    id: "PAR-TN-03",
    acquisitionId: "LA-007",
    gatNo: "Survey No. 114/3",
    ulpin: "TN-KCH-2024-7703",
    owner: "Tmt. V. Annapoornani",
    authority: "SIPCOT",
    district: "Kanchipuram",
    taluka: "Sriperumbudur",
    village: "Mambakkam (Electronics Corridor)",
    areaHa: 4.10,
    areaGuntha: 164,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 6800,
    marketValueCr: 4.18,
    solatiumCr: 4.18,
    totalAwardCr: 8.36,
    status: "Pending",
    disputeNote: "Form VIII award inquiry hearing scheduled with DRO (Land Acquisition)",
    coordinates: [
      [12.9710, 79.9455],
      [12.9740, 79.9472],
      [12.9740, 79.9504],
      [12.9710, 79.9487],
    ],
    center: [12.9725, 79.9480],
  },
  {
    id: "PAR-TN-04",
    acquisitionId: "LA-007",
    gatNo: "Survey No. 115/2",
    ulpin: "TN-KCH-2024-7704",
    owner: "Sriperumbudur Industrial Holdings & Trust",
    authority: "SIPCOT",
    district: "Kanchipuram",
    taluka: "Sriperumbudur",
    village: "Mambakkam (Electronics Corridor)",
    areaHa: 4.80,
    areaGuntha: 192,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 6800,
    marketValueCr: 4.90,
    solatiumCr: 4.90,
    totalAwardCr: 9.80,
    status: "Cleared",
    coordinates: [
      [12.9650, 79.9455],
      [12.9680, 79.9473],
      [12.9680, 79.9505],
      [12.9650, 79.9487],
    ],
    center: [12.9665, 79.9480],
  },
  {
    id: "PAR-TN-05",
    acquisitionId: "LA-006",
    gatNo: "Survey No. 116/1",
    ulpin: "TN-KCH-2024-7705",
    owner: "D. Arumugam Pillai",
    authority: "SIPCOT",
    district: "Kanchipuram",
    taluka: "Sriperumbudur",
    village: "Mambakkam (Electronics Corridor)",
    areaHa: 3.20,
    areaGuntha: 128,
    landClass: "Padit (Fallow)",
    circleRatePerSqM: 6000,
    marketValueCr: 2.88,
    solatiumCr: 2.88,
    totalAwardCr: 5.76,
    status: "Cleared",
    coordinates: [
      [12.9680, 79.9473],
      [12.9710, 79.9490],
      [12.9710, 79.9522],
      [12.9680, 79.9505],
    ],
    center: [12.9695, 79.9498],
  },

  // ── Rajasthan RIICO Neemrana Japanese Industrial Corridor parcels (Kotputli-Behror / Alwar) ──
  {
    id: "PAR-RAJ-01",
    acquisitionId: "LA-008",
    gatNo: "Khasra No. 341/2",
    ulpin: "RJ-ALW-2024-5501",
    owner: "Chaudhary Balram Singh & Legal Heirs",
    authority: "RIICO",
    district: "Kotputli-Behror",
    taluka: "Neemrana",
    village: "Majrakath (Japanese Zone)",
    areaHa: 4.30,
    areaGuntha: 172,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 4600,
    marketValueCr: 2.97,
    solatiumCr: 2.97,
    totalAwardCr: 5.94,
    status: "Cleared",
    coordinates: [
      [27.9890, 76.3850],
      [27.9920, 76.3868],
      [27.9920, 76.3900],
      [27.9890, 76.3882],
    ],
    center: [27.9905, 76.3875],
  },
  {
    id: "PAR-RAJ-02",
    acquisitionId: "LA-008",
    gatNo: "Khasra No. 342/1",
    ulpin: "RJ-ALW-2024-5502",
    owner: "Hukumchand Yadav & Sons",
    authority: "RIICO",
    district: "Kotputli-Behror",
    taluka: "Neemrana",
    village: "Majrakath (Japanese Zone)",
    areaHa: 3.40,
    areaGuntha: 136,
    landClass: "Jirayat (Dry crop)",
    circleRatePerSqM: 4600,
    marketValueCr: 2.35,
    solatiumCr: 2.35,
    totalAwardCr: 4.70,
    status: "Disputed",
    disputeNote: "Rajasthan HC (Jaipur Bench) CW 7812/2024 (Solatium Disbursement Dispute)",
    coordinates: [
      [27.9920, 76.3868],
      [27.9950, 76.3885],
      [27.9950, 76.3917],
      [27.9920, 76.3900],
    ],
    center: [27.9935, 76.3892],
  },
  {
    id: "PAR-RAJ-03",
    acquisitionId: "LA-009",
    gatNo: "Khasra No. 343/3B",
    ulpin: "RJ-ALW-2024-5503",
    owner: "Smt. Shanti Devi Gurjar",
    authority: "RIICO",
    district: "Kotputli-Behror",
    taluka: "Neemrana",
    village: "Majrakath (Japanese Zone)",
    areaHa: 3.90,
    areaGuntha: 156,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 5100,
    marketValueCr: 2.98,
    solatiumCr: 2.98,
    totalAwardCr: 5.96,
    status: "Pending",
    disputeNote: "Section 19 statutory declaration verification under review",
    coordinates: [
      [27.9950, 76.3885],
      [27.9980, 76.3902],
      [27.9980, 76.3934],
      [27.9950, 76.3917],
    ],
    center: [27.9965, 76.3910],
  },
  {
    id: "PAR-RAJ-04",
    acquisitionId: "LA-009",
    gatNo: "Khasra No. 344/1A",
    ulpin: "RJ-ALW-2024-5504",
    owner: "Prithviraj Meena & Co-sharers",
    authority: "RIICO",
    district: "Kotputli-Behror",
    taluka: "Neemrana",
    village: "Majrakath (Japanese Zone)",
    areaHa: 5.10,
    areaGuntha: 204,
    landClass: "Bagayat (Irrigated)",
    circleRatePerSqM: 5100,
    marketValueCr: 3.90,
    solatiumCr: 3.90,
    totalAwardCr: 7.80,
    status: "Cleared",
    coordinates: [
      [27.9890, 76.3885],
      [27.9920, 76.3903],
      [27.9920, 76.3935],
      [27.9890, 76.3917],
    ],
    center: [27.9905, 76.3910],
  },
  {
    id: "PAR-RAJ-05",
    acquisitionId: "LA-008",
    gatNo: "Khasra No. 345/2",
    ulpin: "RJ-ALW-2024-5505",
    owner: "Neemrana Industrial Cooperative",
    authority: "RIICO",
    district: "Kotputli-Behror",
    taluka: "Neemrana",
    village: "Majrakath (Japanese Zone)",
    areaHa: 4.00,
    areaGuntha: 160,
    landClass: "Padit (Fallow)",
    circleRatePerSqM: 4200,
    marketValueCr: 2.52,
    solatiumCr: 2.52,
    totalAwardCr: 5.04,
    status: "Cleared",
    coordinates: [
      [27.9920, 76.3903],
      [27.9950, 76.3920],
      [27.9950, 76.3952],
      [27.9920, 76.3935],
    ],
    center: [27.9935, 76.3928],
  },
];

// Proposed 90-Meter Right-of-Way (ROW) Expressway / Highway Centerlines
const puneRowCorridor: [number, number][] = [
  [18.7535, 73.8604],
  [18.7565, 73.8599],
  [18.7595, 73.8594],
  [18.7625, 73.8588],
  [18.7650, 73.8583],
];

const kiadbRowCorridor: [number, number][] = [
  [13.1945, 77.7058],
  [13.1975, 77.7075],
  [13.2005, 77.7092],
  [13.2035, 77.7108],
];

const gidcRowCorridor: [number, number][] = [
  [22.2460, 72.1820],
  [22.2490, 72.1840],
  [22.2520, 72.1860],
  [22.2550, 72.1880],
  [22.2580, 72.1900],
];

const sipcotRowCorridor: [number, number][] = [
  [12.9635, 79.9425],
  [12.9665, 79.9442],
  [12.9695, 79.9460],
  [12.9725, 79.9478],
  [12.9755, 79.9495],
];

const riicoRowCorridor: [number, number][] = [
  [27.9875, 76.3855],
  [27.9905, 76.3872],
  [27.9935, 76.3890],
  [27.9965, 76.3908],
  [27.9995, 76.3925],
];

interface LeafletCadastralMapProps {
  selectedParcel: CadastralFeature | null;
  onSelectParcel: (parcel: CadastralFeature) => void;
  activeLayer: "cadastral" | "satellite" | "alignment";
  onLayerChange?: (layer: "cadastral" | "satellite" | "alignment") => void;
  selectedAuthority: AuthorityCode;
}

export default function LeafletCadastralMap({
  selectedParcel,
  onSelectParcel,
  activeLayer,
  onLayerChange,
  selectedAuthority,
}: LeafletCadastralMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<{ [id: string]: L.Polygon }>({});
  const markerLayersRef = useRef<L.Marker[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const corridorLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryStonesLayerRef = useRef<L.LayerGroup | null>(null);

  const [showRowBuffer, setShowRowBuffer] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: string; lng: string }>({
    lat: "18.7582° N",
    lng: "73.8595° E",
  });

  // Filter parcels according to selected authority
  const displayedParcels = statutoryCadastralParcels.filter(
    (p) => selectedAuthority === "ALL" || p.authority === selectedAuthority
  );

  // Center points aligned directly over the highway corridor
  const mapCenter: [number, number] =
    selectedAuthority === "KIADB"
      ? [13.1990, 77.7082]
      : selectedAuthority === "GIDC"
      ? [22.2520, 72.1860]
      : selectedAuthority === "SIPCOT"
      ? [12.9690, 79.9460]
      : selectedAuthority === "RIICO"
      ? [27.9930, 76.3890]
      : [18.7582, 73.8596];

  const currentCorridor =
    selectedAuthority === "KIADB"
      ? kiadbRowCorridor
      : selectedAuthority === "GIDC"
      ? gidcRowCorridor
      : selectedAuthority === "SIPCOT"
      ? sipcotRowCorridor
      : selectedAuthority === "RIICO"
      ? riicoRowCorridor
      : puneRowCorridor;

  // Tile Providers: Clean OpenStreetMap (2D) and Esri World Imagery (Satellite)
  const getTileUrl = (layer: "cadastral" | "satellite" | "alignment") => {
    if (layer === "satellite") {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }
    // High-resolution, zero watermark OpenStreetMap standard tiles
    return "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  };

  const getTileAttribution = (layer: "cadastral" | "satellite" | "alignment") => {
    if (layer === "satellite") {
      return "Tiles &copy; Esri &mdash; National Remote Sensing Centre (NRSC/ISRO Bhuvan)";
    }
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • NIC GIS Platform';
  };

  // ── Initialize Leaflet Map ──
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add initial base tile layer
    const baseTile = L.tileLayer(getTileUrl(activeLayer), {
      maxZoom: 19,
      attribution: getTileAttribution(activeLayer),
    }).addTo(map);
    tileLayerRef.current = baseTile;

    // Layer groups for corridor & survey stones
    corridorLayerRef.current = L.layerGroup().addTo(map);
    boundaryStonesLayerRef.current = L.layerGroup().addTo(map);

    // Cursor tracking with Indian coordinates
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: `${e.latlng.lat.toFixed(5)}° N`,
        lng: `${e.latlng.lng.toFixed(5)}° E`,
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ── Switch Base Tiles on Layer Toggle ──
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    const newTile = L.tileLayer(getTileUrl(activeLayer), {
      maxZoom: 19,
      attribution: getTileAttribution(activeLayer),
    }).addTo(map);
    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // ── Recenter Map when Authority Changes or Selected Parcel changes ──
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (selectedParcel) {
      mapInstanceRef.current.setView(selectedParcel.center, 16);
    } else {
      mapInstanceRef.current.setView(mapCenter, 16);
    }
  }, [selectedAuthority, selectedParcel?.id]);

  // ── Render Contiguous Cadastral Polygons, ROW Corridor & Survey Stones ──
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old polygon and marker layers
    Object.values(polygonLayersRef.current).forEach((layer) => map.removeLayer(layer));
    polygonLayersRef.current = {};

    markerLayersRef.current.forEach((marker) => map.removeLayer(marker));
    markerLayersRef.current = [];

    if (boundaryStonesLayerRef.current) {
      boundaryStonesLayerRef.current.clearLayers();
    }

    // Render 90m ROW Corridor Line & Buffer Swath
    if (corridorLayerRef.current) {
      corridorLayerRef.current.clearLayers();

      if (showRowBuffer) {
        // 90m ROW Corridor Buffer band (48px width)
        const bufferBand = L.polyline(currentCorridor, {
          color: activeLayer === "satellite" ? "#60a5fa" : "#3b82f6",
          weight: 42,
          opacity: activeLayer === "satellite" ? 0.35 : 0.25,
          lineCap: "round",
          lineJoin: "round",
        });

        bufferBand.bindTooltip(
          "90-Meter Right-of-Way (ROW) Statutory Highway Alignment Corridor",
          {
            sticky: true,
            className: "bg-[#0b2545] text-white text-[11px] font-sans px-2.5 py-1 rounded-md shadow-lg border border-blue-400/30",
          }
        );

        // Highway Centerline
        const centerLine = L.polyline(currentCorridor, {
          color: "#1d4ed8",
          weight: 3.5,
          dashArray: "7, 5",
          opacity: 0.95,
        });

        corridorLayerRef.current.addLayer(bufferBand);
        corridorLayerRef.current.addLayer(centerLine);
      }
    }

    // Render each cadastral survey plot
    displayedParcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;

      // Statutory Indian Revenue Cadastral Colors:
      // Green = Cleared & Award Disbursed
      // Amber = Under Section 15 Hearing / SIA Objection
      // Red = Court Stay (Section 64 / High Court WP)
      let fillColor = "#16a34a"; // Green-600
      let strokeColor = "#15803d"; // Green-700
      if (parcel.status === "Pending") {
        fillColor = "#d97706"; // Amber-600
        strokeColor = "#b45309";
      } else if (parcel.status === "Disputed") {
        fillColor = "#dc2626"; // Red-600
        strokeColor = "#b91c1c";
      }

      if (isSelected) {
        fillColor = "#2563eb"; // Blue-600
        strokeColor = "#1e40af";
      }

      // Add polygon with subtle opacity over satellite or crisp over 2D
      const polygon = L.polygon(parcel.coordinates, {
        color: isSelected ? "#1d4ed8" : strokeColor,
        fillColor: fillColor,
        fillOpacity: isSelected
          ? 0.75
          : activeLayer === "satellite"
          ? 0.40
          : 0.52,
        weight: isSelected ? 3.5 : 2,
        dashArray: isSelected ? undefined : "4, 2",
      }).addTo(map);

      // Detailed Revenue Dossier Tooltip (XSS-safe)
      polygon.bindTooltip(
        `<div class="p-1.5 leading-snug font-sans min-w-[190px]">
          <div class="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
            <span class="font-extrabold text-[12px] text-[#0b2545]">${escapeHtml(parcel.gatNo)}</span>
            <span class="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">${escapeHtml(parcel.ulpin)}</span>
          </div>
          <p class="text-[11px] text-slate-800 font-semibold truncate">${escapeHtml(parcel.owner)}</p>
          <div class="mt-1 flex items-center justify-between text-[10px] text-slate-600 font-medium">
            <span>Area: <strong>${escapeHtml(parcel.areaHa)} Ha (${escapeHtml(parcel.areaGuntha)} G)</strong></span>
            <span>${escapeHtml(parcel.landClass)}</span>
          </div>
          <div class="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span class="font-bold text-slate-900">Award: ₹${escapeHtml(parcel.totalAwardCr)} Cr</span>
            <span class="text-[10px] font-bold ${
              parcel.status === "Cleared"
                ? "text-green-700"
                : parcel.status === "Disputed"
                ? "text-red-700"
                : "text-amber-700"
            }">${escapeHtml(parcel.status.toUpperCase())}</span>
          </div>
        </div>`,
        {
          sticky: true,
          className: "bg-white border border-slate-300 rounded-lg shadow-2xl p-0",
        }
      );

      // Clean, well-spaced Badge Label centered inside each parcel block (XSS-safe)
      const labelIcon = L.divIcon({
        className: "custom-gat-label",
        html: `<div style="
          background: ${isSelected ? "#1d4ed8" : "rgba(11, 37, 69, 0.90)"};
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          white-space: nowrap;
          border: 1.5px solid ${isSelected ? "#93c5fd" : "rgba(255, 255, 255, 0.75)"};
          box-shadow: 0 3px 6px rgba(0,0,0,0.35);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: all 0.15s ease;
        ">
          <span>${escapeHtml(parcel.gatNo)}</span>
          <span style="opacity: 0.8; font-weight: normal; font-size: 9.5px;">(${escapeHtml(parcel.areaHa)} Ha)</span>
        </div>`,
        iconSize: [0, 0],
      });

      const labelMarker = L.marker(parcel.center, {
        icon: labelIcon,
        interactive: true,
      }).addTo(map);

      labelMarker.on("click", () => {
        onSelectParcel(parcel);
      });

      polygon.on("click", () => {
        onSelectParcel(parcel);
      });

      polygonLayersRef.current[parcel.id] = polygon;
      markerLayersRef.current.push(labelMarker);

      // Add Survey Boundary Corner Stones (Hadd Nishan)
      if (boundaryStonesLayerRef.current) {
        parcel.coordinates.forEach((vertex) => {
          const stoneMarker = L.circleMarker(vertex, {
            radius: 3,
            color: "#0b2545",
            fillColor: "#ffffff",
            fillOpacity: 1,
            weight: 1.5,
          });
          boundaryStonesLayerRef.current?.addLayer(stoneMarker);
        });
      }
    });
  }, [displayedParcels, selectedParcel, activeLayer, selectedAuthority, showRowBuffer]);

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating 2D vs Satellite Toggleable Map Switcher (Top-Right) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 p-1 backdrop-blur-sm shadow-md text-[11px] font-sans">
        <button
          onClick={() => onLayerChange && onLayerChange("cadastral")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
            activeLayer !== "satellite"
              ? "bg-[#0b2545] text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="Switch to 2D Cadastral Revenue Map"
        >
          <span>🗺️ 2D Cadastral</span>
        </button>

        <button
          onClick={() => onLayerChange && onLayerChange("satellite")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
            activeLayer === "satellite"
              ? "bg-[#0b2545] text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title="Switch to High-Resolution Satellite Imagery"
        >
          <span>🛰️ Satellite</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        <button
          onClick={() => setShowRowBuffer((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium text-[10px] transition ${
            showRowBuffer
              ? "bg-blue-50 text-blue-800 border border-blue-300"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          title="Toggle 90m Right-of-Way Corridor Buffer"
        >
          <span>90m ROW</span>
          <span className={`h-1.5 w-1.5 rounded-full ${showRowBuffer ? "bg-blue-600" : "bg-slate-400"}`} />
        </button>
      </div>

      {/* Floating Indian Revenue Metadata HUD (Top-Left) */}
      <div className="absolute top-3 left-3 z-10 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[11px] backdrop-blur-sm shadow-md font-sans">
        <div className="flex items-center gap-1.5 font-bold text-[#0b2545]">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Cadastral Spatial Engine • Survey of India Datum</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-600 font-mono">
          <span>Projection: <strong>{selectedAuthority === "SIPCOT" ? "WGS 84 / UTM Zone 44N" : "WGS 84 / UTM Zone 43N"}</strong></span>
          <span>•</span>
          <span>Datum: <strong>{selectedAuthority === "SIPCOT" ? "EPSG:32644" : "EPSG:32643"}</strong></span>
        </div>
      </div>

      {/* Floating Coordinate Cursor HUD (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-10 rounded-md bg-[#0b2545]/90 px-3 py-1.5 text-[10px] font-mono text-white backdrop-blur-sm shadow-md flex items-center gap-3">
        <span>Lat: <strong className="text-amber-300">{cursorCoords.lat}</strong></span>
        <span>Lng: <strong className="text-amber-300">{cursorCoords.lng}</strong></span>
        <span className="text-slate-400">|</span>
        <span className="text-green-300 font-bold">● NIC GIS Service Live</span>
      </div>

      {/* Indian Statutory Map Legend (Bottom-Center) */}
      <div className="absolute bottom-3 right-16 z-10 hidden md:flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm shadow-md font-sans">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-green-600 border border-green-800" />
          <span className="text-slate-700">Cleared & Disbursed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-500 border border-amber-700" />
          <span className="text-slate-700">Sec 15 Hearing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-600 border border-red-800" />
          <span className="text-slate-700">Court Stay (Sec 64)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 bg-blue-600 border-t border-dashed border-blue-800" />
          <span className="text-slate-700">90m ROW Alignment</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-white border border-[#0b2545]" />
          <span className="text-[10px] text-slate-500">Hadd Stone</span>
        </div>
      </div>
    </div>
  );
}
