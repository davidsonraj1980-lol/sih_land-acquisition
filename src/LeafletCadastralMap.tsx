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
      : [18.7582, 73.8596];

  const currentCorridor =
    selectedAuthority === "KIADB" ? kiadbRowCorridor : puneRowCorridor;

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

  // ── Recenter Map when Authority Changes ──
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(mapCenter, 16);
  }, [selectedAuthority]);

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
          <span>Projection: <strong>WGS 84 / UTM Zone 43N</strong></span>
          <span>•</span>
          <span>Datum: <strong>EPSG:32643</strong></span>
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
