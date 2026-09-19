# National Land Acquisition Monitoring Portal (NLAMP)
### राष्ट्रीय भूमि अधिग्रहण निगरानी पोर्टल
**Department of Land Resources (DoLR) • Ministry of Rural Development, Government of India**  
*Real-Time National Land Acquisition & Management System for End-to-End Digital Monitoring and Decision Support*

---

## Overview

The **National Land Acquisition Monitoring Portal (NLAMP)** is a unified national geospatial platform digitizing the complete statutory land acquisition lifecycle across India under the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act 2013)**.

The platform unifies fragmented state systems into a centralized digital workflow connecting Central Ministries (MoRTH, Railways, MoRD), State Industrial Development Corporations (**MIDC**, **KIADB**, **GIDC**, **SIPCOT**, **RIICO**), District Collectors, Special Land Acquisition Officers (SLAOs), and affected landholders (*Khatadars*).

---

## Key Capabilities & Statutory Compliance

### 1. Interactive Cadastral Spatial GIS Engine
- **Datum & Projection**: Conforms to Survey of India standards (**WGS 84 / UTM Zone 43N • Datum EPSG:32643**).
- **Corridor Alignment**: Revenue parcel plots (*Gat Numbers / Survey Numbers*) align directly along industrial and highway corridors (e.g., Pune-Nashik NH 60 MIDC Chakan link; Bengaluru Devanahalli KIADB Aerospace Park).
- **Dual-Layer Basemap Toggle**: Seamless on-map switcher between **2D Cadastral Map** (OpenStreetMap cartography) and **High-Resolution Satellite Imagery** (Esri World Imagery / ISRO Bhuvan).
- **Statutory Right-of-Way (ROW)**: 90-meter highway corridor buffer band and centerline tracking.
- **Survey Boundary Stones (*Hadd Nishan*)**: Demarcation of parcel corner vertices conforming to cadastral survey standards.

### 2. Statutory RFCTLARR Act 2013 Compliance Engine
- **Section 26 Market Value**: Circle rate (Ready Reckoner) computation with rural distance multiplier (1.0x to 2.0x).
- **Section 29 Assets Attached to Land**: Valuation of trees, wells, irrigation borewells, and standing structures.
- **Section 30(1) Solatium**: Mandatory 100% solatium decree on total market value.
- **Section 30(3) Statutory Interest**: 12% per annum additional compensation from preliminary notification to award date.
- **Section 31 Statutory Award**: Form XI Collector's Award decree with digital signature verification.
- **Statutory Lapsing Warning**: 12-month countdown clock for Section 19(7) declarations to prevent proceedings from lapsing under Section 25.

### 3. Rehabilitation & Resettlement (Schedule II & III)
- Census tracking of **Project Affected Families (PAFs)** and **Displaced Families (PDFs)** under Section 3(c).
- Mandatory constructed housing allotment tracking (min 50 sq.m rural / 20 sq.m urban).
- One-time Resettlement Allowance (₹50,000 per family).
- Subsistence Grant (₹3,000/month for 12 months = ₹36,000).
- Special 25% statutory enhancement for SC/ST families under Section 41.
- Verification of 25 mandatory infrastructure amenities under Third Schedule.

### 4. Land Records & Bhu-Aadhaar Interoperability
- **14-Digit ULPIN (*Unique Land Parcel Identification Number*)**: Embedded into every parcel dossier.
- **Digital RoR Extract**: Direct modal integration for **Mahabhulekh 7/12 (Saat-Baara)** and **Bhoomi Karnataka** records.

### 5. Direct Benefit Transfer (PFMS DBT)
- Treasury escrow pool monitoring for compensation disbursement.
- National Payments Corporation of India (NPCI) Aadhaar bank mapper verification.
- Real-time tracking of cleared, disbursed, and held treasury pools.

---

## Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS v4, Official GIGW / NIC Government Design Standards |
| **Geospatial GIS** | Leaflet.js, Proj4js, GeoJSON, EPSG:32643 Projection |
| **Basemap Providers** | OpenStreetMap (2D Vector), Esri World Imagery (Satellite) |
| **Icons & Media** | Lucide React, Official State Emblem of India vector asset (`/emblem.svg`) |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0 or later
- **npm**: v9.0 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/davidsonraj1980-lol/sih_land-acquisition.git
cd sih_land-acquisition

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Build for Production

```bash
# Type-check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## National Portal Architecture & Nodal Nodes

- **Operational Node ID**: `DL-SEC-04` (NIC New Delhi Tier-3 Data Centre)
- **Coordinating Ministry**: Ministry of Rural Development (MoRD)
- **Implementation Body**: Department of Land Resources (DoLR), Government of India
