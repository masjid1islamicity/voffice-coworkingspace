import React, { useState, useMemo } from "react";
import {
  Truck,
  Route,
  Leaf,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  QrCode,
  Share2,
  PackageCheck,
  ShieldCheck,
  RefreshCw,
  FileText,
  Zap,
  ThermometerSnowflake,
  HeartHandshake,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  Building,
  Check,
  ChevronRight,
  Radio,
  ShoppingBag,
} from "lucide-react";
import {
  Tenant,
  LogisticsShipment,
  VehicleFleetOption,
  RouteWaypoint,
  OptimizedDispatchRun,
  DeliveryZoneId,
} from "../types";
import {
  DELIVERY_ZONES,
  VEHICLE_FLEET_OPTIONS,
  INITIAL_LOGISTICS_SHIPMENTS,
} from "../data/logisticsData";
import { LiveBatchMapTracker } from "./LiveBatchMapTracker";
import { SharedProcurementPortal } from "./SharedProcurementPortal";
import { VendorShariahRatingView } from "./VendorShariahRatingView";

interface LogisticsHubProps {
  tenants: Tenant[];
}

export const LogisticsHub: React.FC<LogisticsHubProps> = ({ tenants }) => {
  // Local states
  const [activeSubTab, setActiveSubTab] = useState<
    "optimizer" | "live_tracker" | "shared_procurement" | "vendor_ratings" | "pool_manager" | "fleet_carbon" | "manifest_pod"
  >("live_tracker");

  const [shipments, setShipments] = useState<LogisticsShipment[]>(
    INITIAL_LOGISTICS_SHIPMENTS
  );
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>(
    INITIAL_LOGISTICS_SHIPMENTS.map((s) => s.id)
  );

  const [selectedFleetId, setSelectedFleetId] = useState<string>("ev-van-01");
  const [hubOrigin, setHubOrigin] = useState<string>(
    "Sentra Bisnis Wakaf Masjid Agung Islamicity, Menteng, Jakarta Pusat"
  );
  const [optimizationPriority, setOptimizationPriority] = useState<
    "carbon_first" | "cost_first" | "fastest_time" | "balanced"
  >("balanced");
  const [includePrayerBreak, setIncludePrayerBreak] = useState<boolean>(true);
  const [driverName, setDriverName] = useState<string>(
    "Ust. Rahmat Hidayat (Eco-Fleet Captain)"
  );
  const [driverPhone, setDriverPhone] = useState<string>("0812-3344-5566");

  // AI Optimization Result State
  const [optimizedRun, setOptimizedRun] = useState<OptimizedDispatchRun | null>(
    null
  );
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);

  // New Shipment Modal Form State
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState<boolean>(false);
  const [filterZone, setFilterZone] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // New Shipment Form Fields
  const [newTenantId, setNewTenantId] = useState<string>(
    tenants[0]?.id || "t-1"
  );
  const [newRecipientName, setNewRecipientName] = useState<string>("");
  const [newRecipientPhone, setNewRecipientPhone] = useState<string>("");
  const [newAddress, setNewAddress] = useState<string>("");
  const [newZone, setNewZone] = useState<DeliveryZoneId>("jaksel");
  const [newCategory, setNewCategory] = useState<
    LogisticsShipment["packageCategory"]
  >("Halal F&B / Frozen");
  const [newWeightKg, setNewWeightKg] = useState<number>(5);
  const [newVolumeM3, setNewVolumeM3] = useState<number>(0.03);
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const [newDeclaredValue, setNewDeclaredValue] = useState<number>(1000000);
  const [newPriority, setNewPriority] = useState<
    "same_day" | "next_day" | "eco_standard"
  >("same_day");
  const [newRequiresColdChain, setNewRequiresColdChain] =
    useState<boolean>(false);
  const [newIsFragile, setNewIsFragile] = useState<boolean>(false);

  // Completed Waypoint Checkbox Tracking
  const [completedStops, setCompletedStops] = useState<{
    [stopIndex: number]: boolean;
  }>({});

  const selectedFleet = useMemo(() => {
    return (
      VEHICLE_FLEET_OPTIONS.find((f) => f.id === selectedFleetId) ||
      VEHICLE_FLEET_OPTIONS[0]
    );
  }, [selectedFleetId]);

  // Selected Shipments for the Current Pool
  const pooledShipments = useMemo(() => {
    return shipments.filter((s) => selectedShipmentIds.includes(s.id));
  }, [shipments, selectedShipmentIds]);

  const totalPoolWeightKg = useMemo(() => {
    return pooledShipments.reduce((acc, s) => acc + (s.weightKg || 0), 0);
  }, [pooledShipments]);

  const totalPoolVolumeM3 = useMemo(() => {
    return pooledShipments.reduce((acc, s) => acc + (s.volumeM3 || 0), 0);
  }, [pooledShipments]);

  const weightUtilizationPercent = Math.min(
    100,
    Math.round((totalPoolWeightKg / selectedFleet.capacityKg) * 100)
  );
  const volumeUtilizationPercent = Math.min(
    100,
    Math.round((totalPoolVolumeM3 / selectedFleet.capacityM3) * 100)
  );

  // Overall Global Stats across all shipments
  const globalSummary = useMemo(() => {
    const totalPkg = shipments.length;
    const totalIndCost = shipments.reduce(
      (a, b) => a + b.individualEstimatedCost,
      0
    );
    const totalPooledCost = shipments.reduce(
      (a, b) => a + b.pooledEstimatedCost,
      0
    );
    const costSaved = Math.max(0, totalIndCost - totalPooledCost);
    const costSavedPct =
      totalIndCost > 0 ? Math.round((costSaved / totalIndCost) * 100) : 52;
    const co2SavedKg = Number((shipments.length * 2.35).toFixed(1));
    const kmSaved = Math.round(shipments.length * 9.2);

    return {
      totalPkg,
      totalIndCost,
      totalPooledCost,
      costSaved,
      costSavedPct,
      co2SavedKg,
      kmSaved,
    };
  }, [shipments]);

  // Handler to Run AI Route Optimization
  const handleOptimizeRoutes = async () => {
    if (pooledShipments.length === 0) {
      setOptimizeError(
        "Pilih minimal 1 paket tenant untuk melakukan optimasi rute pengiriman kolaboratif."
      );
      return;
    }

    setIsOptimizing(true);
    setOptimizeError(null);

    try {
      const response = await fetch("/api/ai/optimize-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hubOrigin,
          shipments: pooledShipments,
          vehicleType: selectedFleet.name,
          optimizationPriority,
          includePrayerBreak,
          driverName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const newRun: OptimizedDispatchRun = {
        id: `RUN-${Date.now()}`,
        batchCode:
          data.batchCode ||
          `DISPATCH-CLB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        dispatchDate: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        departureTime: "08:45 WIB",
        vehicle: selectedFleet,
        waypoints: data.optimizedSequence || [],
        shipments: pooledShipments,
        totalDistanceKm: data.routeMetrics?.totalDistanceKm || 38.5,
        totalDurationMin: data.routeMetrics?.totalDurationMin || 140,
        totalWeightKg: totalPoolWeightKg,
        totalVolumeM3: totalPoolVolumeM3,
        capacityWeightUtilizedPercent: weightUtilizationPercent,
        capacityVolumeUtilizedPercent: volumeUtilizationPercent,
        baselineIndividualTotalKm:
          data.routeMetrics?.baselineIndividualTotalKm || 92.0,
        distanceSavedKm: data.routeMetrics?.distanceSavedKm || 53.5,
        distanceSavedPercent: data.routeMetrics?.distanceSavedPercent || 58,
        baselineIndividualTotalCost:
          data.routeMetrics?.baselineIndividualTotalCost || 380000,
        pooledTotalCost: data.routeMetrics?.pooledTotalCost || 175000,
        costSavedTotal: data.routeMetrics?.costSavedTotal || 205000,
        costSavedPercent: data.routeMetrics?.costSavedPercent || 54,
        baselineIndividualCo2Kg:
          data.routeMetrics?.baselineIndividualCo2Kg || 14.8,
        pooledCo2Kg: data.routeMetrics?.pooledCo2Kg || 3.6,
        co2AvoidedKg: data.routeMetrics?.co2AvoidedKg || 11.2,
        co2ReductionPercent: data.routeMetrics?.co2ReductionPercent || 75,
        equivalentTreesPlanted:
          data.routeMetrics?.equivalentTreesPlanted || 0.56,
        ecoScoreGrade: selectedFleet.isElectric
          ? "A+ Zero Emission"
          : "A Eco-Optimized",
        prayerStopsIncluded: data.prayerRestStop
          ? [
              `${data.prayerRestStop.recommendedMosque} (${data.prayerRestStop.stopWindow})`,
            ]
          : ["Masjid Agung Sunda Kelapa (12:00 - 12:35 WIB)"],
        aiBriefingNotes:
          data.aiDispatcherBriefing ||
          "Rute kolaboratif ini sukses mengelompokkan titik antar per-wilayah dan memangkas waktu tempuh.",
        driverName,
        driverPhone,
        qrManifestHash:
          data.qrManifestHash ||
          `CLB-ECO-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        status: "manifest_locked",
      };

      setOptimizedRun(newRun);
      // Reset completed stops
      setCompletedStops({});
    } catch (err: any) {
      console.error("Route optimization error:", err);
      setOptimizeError(
        err?.message ||
          "Gagal menghubungi layanan AI Dispatcher. Menggunakan mode kalkulasi cadangan."
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  // Toggle stop completion
  const handleToggleStop = (stopIdx: number) => {
    setCompletedStops((prev) => ({
      ...prev,
      [stopIdx]: !prev[stopIdx],
    }));
  };

  // Add new shipment handler
  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientName || !newAddress) {
      alert("Mohon lengkapi nama penerima dan alamat pengantaran.");
      return;
    }

    const tenantObj =
      tenants.find((t) => t.id === newTenantId) ||
      tenants[0] || { id: "t-custom", companyName: "Tenant Virtual Office" };
    const zoneObj =
      DELIVERY_ZONES.find((z) => z.id === newZone) || DELIVERY_ZONES[0];

    const indCost = 50000 + newWeightKg * 5000 + (zoneObj.tollRequired ? 15000 : 0);
    const pooledCost = Math.round(indCost * 0.45); // 55% cheaper in collaborative run

    const newShipmentItem: LogisticsShipment = {
      id: `SHP-2026-${String(shipments.length + 1).padStart(3, "0")}`,
      trackingCode: `IVO-LOG-${Math.floor(8800 + Math.random() * 900)}`,
      tenantId: tenantObj.id,
      tenantName: tenantObj.companyName,
      recipientName: newRecipientName,
      recipientPhone: newRecipientPhone || "0812-9988-7766",
      destinationAddress: newAddress,
      destinationZone: newZone,
      zoneLabel: zoneObj.name,
      lat: -6.2 + (Math.random() * 0.1 - 0.05),
      lng: 106.8 + (Math.random() * 0.1 - 0.05),
      packageCategory: newCategory,
      weightKg: Number(newWeightKg),
      volumeM3: Number(newVolumeM3),
      itemDescription: newItemDescription || `${newCategory} Paket Siap Kirim`,
      declaredValue: Number(newDeclaredValue),
      priority: newPriority,
      requiresColdChain: newRequiresColdChain,
      isFragile: newIsFragile,
      isHalalCertifiedPackage: true,
      status: "pending_pool",
      individualEstimatedCost: indCost,
      pooledEstimatedCost: pooledCost,
      registeredAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setShipments([newShipmentItem, ...shipments]);
    setSelectedShipmentIds((prev) => [...prev, newShipmentItem.id]);
    setIsAddShipmentOpen(false);

    // Reset Form
    setNewRecipientName("");
    setNewRecipientPhone("");
    setNewAddress("");
    setNewItemDescription("");
  };

  // Filtered shipments for Pool Manager tab
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchZone = filterZone === "all" || s.destinationZone === filterZone;
      const matchSearch =
        searchQuery === "" ||
        s.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchSearch;
    });
  }, [shipments, filterZone, searchQuery]);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Banner & Overview Card */}
      <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[#2D2D22] via-[#3E3E2C] to-[#5A5A40] text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E4E3DA] text-xs font-semibold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5 text-[#E4E3DA]" />
              Logistics Hub & Collaborative Shipping
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#8A8A6A]/40 text-white text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              Green Logistics & Carbon Optimizer
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Sentra Distribusi & Rute Cerdas Kolaboratif
            </h2>
            <p className="text-sm sm:text-base text-[#E4E3DA]/90 leading-relaxed font-light">
              Konsolidasi pengiriman multi-tenant dari sentra kantor masjid.
              Otomasi klasterisasi rute tercepat via AI, menekan emisi karbon ($kg\ CO_2e$),
              memangkas biaya logistik hingga 55%, serta menyisipkan adab istirahat shalat tepat waktu.
            </p>
          </div>

          {/* Quick Metrics Ribbons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA] flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5" /> Total Paket Pool
              </div>
              <div className="text-xl font-bold font-mono mt-1 text-white">
                {globalSummary.totalPkg} Paket
              </div>
              <div className="text-[10px] text-emerald-300 mt-0.5">
                {selectedShipmentIds.length} Terpilih dalam Rute
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA] flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-300" /> Emisi Dihindari
              </div>
              <div className="text-xl font-bold font-mono mt-1 text-emerald-300">
                {globalSummary.co2SavedKg} kg CO₂e
              </div>
              <div className="text-[10px] text-[#E4E3DA]/80 mt-0.5">
                ~{(globalSummary.co2SavedKg * 0.05).toFixed(1)} Pohon Terselamatkan
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA] flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-300" /> Hemat Biaya
              </div>
              <div className="text-xl font-bold font-mono mt-1 text-amber-300">
                Rp {globalSummary.costSaved.toLocaleString("id-ID")}
              </div>
              <div className="text-[10px] text-[#E4E3DA]/80 mt-0.5">
                Hemat ~{globalSummary.costSavedPct}% vs Kirim Sendiri
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-[#E4E3DA] flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-sky-300" /> Jarak Terpangkas
              </div>
              <div className="text-xl font-bold font-mono mt-1 text-sky-300">
                {globalSummary.kmSaved} km
              </div>
              <div className="text-[10px] text-[#E4E3DA]/80 mt-0.5">
                Looping Efisien Tanpa Redundansi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab("optimizer")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "optimizer"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#5A5A40] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>1. Dispatch Optimizer</span>
            {optimizedRun && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("live_tracker")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "live_tracker"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#5A5A40] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>2. Live Radar & Peta Rute</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </button>

          <button
            onClick={() => setActiveSubTab("shared_procurement")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "shared_procurement"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#5A5A40] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            <span>3. Portal Pengadaan Bersama</span>
          </button>

          <button
            onClick={() => setActiveSubTab("pool_manager")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "pool_manager"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#5A5A40] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Shipment Pool ({shipments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("fleet_carbon")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "fleet_carbon"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#5A5A40] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>5. Armada & Karbon ESG</span>
          </button>

          <button
            onClick={() => setActiveSubTab("manifest_pod")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "manifest_pod"
                ? "bg-[#5A5A40] text-white shadow-xs"
                : "bg-white text-[#5A5A40] hover:bg-[#f5f2ed] border border-black/5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>6. Surat Jalan & Manifest</span>
          </button>
        </div>

        <button
          onClick={() => setIsAddShipmentOpen(true)}
          className="px-4 py-2 bg-[#8A8A6A] hover:bg-[#727254] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Paket Tenant ke Pool</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: DISPATCH OPTIMIZER & LIVE WAYPOINT SEQUENCE                   */}
      {/* ========================================================================= */}
      {activeSubTab === "optimizer" && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2d2d22] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#5A5A40]" />
                  Konfigurasi & Parameter Dispatch Run
                </h3>
                <p className="text-xs text-[#72725e]">
                  Tentukan armada, prioritas optimasi ramah lingkungan, dan jadwal istirahat shalat pengemudi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOptimizeRoutes}
                  disabled={isOptimizing || selectedShipmentIds.length === 0}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                    isOptimizing
                      ? "bg-[#5A5A40]/70 text-white cursor-wait"
                      : "bg-[#5A5A40] hover:bg-[#484833] text-white"
                  }`}
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#E4E3DA]" />
                      <span>Sedang Mengoptimasi Rute AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
                      <span>Hitung Rute Kolaboratif AI ({selectedShipmentIds.length} Paket)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {optimizeError && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <div>
                  <div className="font-bold">Perhatian Parameter:</div>
                  <div>{optimizeError}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Departure Hub Origin */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Hub Keberangkatan (Origin)
                </label>
                <input
                  type="text"
                  value={hubOrigin}
                  onChange={(e) => setHubOrigin(e.target.value)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  placeholder="Nama & Alamat Sentra Hub"
                />
              </div>

              {/* Vehicle Fleet Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Armada Operasional
                </label>
                <select
                  value={selectedFleetId}
                  onChange={(e) => setSelectedFleetId(e.target.value)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                >
                  {VEHICLE_FLEET_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.efficiencyRating})
                    </option>
                  ))}
                </select>
              </div>

              {/* Optimization Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Prioritas Optimasi
                </label>
                <select
                  value={optimizationPriority}
                  onChange={(e: any) => setOptimizationPriority(e.target.value)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                >
                  <option value="balanced">Sinergi Berimbang (Biaya & Karbon)</option>
                  <option value="carbon_first">Green Carbon First (Min. kg CO₂e)</option>
                  <option value="cost_first">Biaya Terendah (Max. Cost Sharing)</option>
                  <option value="fastest_time">Waktu Tercepat (SLA Prioritas)</option>
                </select>
              </div>

              {/* Driver Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Kurir / Captain Fleet
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  placeholder="Nama Captain Driver"
                />
              </div>
            </div>

            {/* Capacity & Prayer Toggle Ribbon */}
            <div className="bg-[#fcfbf9] rounded-2xl p-4 border border-black/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 text-xs text-[#2d2d22]">
                <div>
                  <span className="text-[#72725e]">Kapasitas Berat: </span>
                  <span className="font-mono font-bold">
                    {totalPoolWeightKg.toFixed(1)} / {selectedFleet.capacityKg} kg
                  </span>
                  <span className="ml-1 text-[11px] font-semibold text-[#5A5A40]">
                    ({weightUtilizationPercent}%)
                  </span>
                </div>

                <div>
                  <span className="text-[#72725e]">Kapasitas Volume: </span>
                  <span className="font-mono font-bold">
                    {totalPoolVolumeM3.toFixed(2)} / {selectedFleet.capacityM3} m³
                  </span>
                  <span className="ml-1 text-[11px] font-semibold text-[#5A5A40]">
                    ({volumeUtilizationPercent}%)
                  </span>
                </div>

                {selectedFleet.isElectric && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" /> Bebas Aturan Ganjil-Genap (EV)
                  </span>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2d2d22] select-none">
                <input
                  type="checkbox"
                  checked={includePrayerBreak}
                  onChange={(e) => setIncludePrayerBreak(e.target.checked)}
                  className="rounded text-[#5A5A40] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Sisipkan Jeda Shalat Fardhu di Masjid Terdekat</span>
              </label>
            </div>
          </div>

          {/* If optimized run exists, show detailed results */}
          {optimizedRun ? (
            <div className="space-y-6">
              {/* Comparative Optimization Benchmark Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Single Courier vs Collaborative Comparison */}
                <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#72725e] uppercase tracking-wider">
                      Jarak Tempuh Total
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Hemat {optimizedRun.distanceSavedPercent}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-serif font-bold text-[#2d2d22]">
                      {optimizedRun.totalDistanceKm} km
                    </div>
                    <div className="text-xs text-rose-500 line-through">
                      {optimizedRun.baselineIndividualTotalKm} km (Kirim Terpisah)
                    </div>
                  </div>
                  <div className="text-xs text-[#72725e]">
                    Memotong <strong className="text-emerald-700">{optimizedRun.distanceSavedKm} km</strong> perjalanan redundan.
                  </div>
                </div>

                {/* Financial Cost Savings */}
                <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#72725e] uppercase tracking-wider">
                      Total Biaya Pengiriman
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Hemat {optimizedRun.costSavedPercent}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-serif font-bold text-[#2d2d22]">
                      Rp {optimizedRun.pooledTotalCost.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-rose-500 line-through">
                      Rp {optimizedRun.baselineIndividualTotalCost.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="text-xs text-[#72725e]">
                    Tenant bersama-sama menghemat <strong className="text-amber-800">Rp {optimizedRun.costSavedTotal.toLocaleString("id-ID")}</strong>.
                  </div>
                </div>

                {/* Carbon Footprint Reduction */}
                <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#72725e] uppercase tracking-wider">
                      Reduksi Emisi Karbon
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {optimizedRun.ecoScoreGrade}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-serif font-bold text-emerald-700">
                      {optimizedRun.co2AvoidedKg} kg CO₂e
                    </div>
                    <div className="text-xs text-[#72725e]">
                      dari {optimizedRun.baselineIndividualCo2Kg} kg
                    </div>
                  </div>
                  <div className="text-xs text-[#72725e]">
                    Reduksi <strong className="text-emerald-700">{optimizedRun.co2ReductionPercent}% emisi</strong> (~{optimizedRun.equivalentTreesPlanted} bibit pohon ditanam).
                  </div>
                </div>
              </div>

              {/* AI Dispatcher Strategic Briefing Card */}
              <div className="bg-[#fcfbf9] rounded-[24px] border border-[#5A5A40]/15 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                      Catatan Taktis AI Dispatcher & Panduan Amanah Kurir
                    </h4>
                    <p className="text-[11px] text-[#72725e]">
                      Analisis urutan pengantaran cerdas (Traveling Salesperson / VRP) & jadwal jeda shalat.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#2d2d22] leading-relaxed bg-white p-4 rounded-xl border border-black/5">
                  {optimizedRun.aiBriefingNotes}
                </p>

                {optimizedRun.prayerStopsIncluded.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#5A5A40] bg-[#f5f2ed] px-3.5 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-[#5A5A40] shrink-0" />
                    <span>Jadwal Shalat Berjamaah: {optimizedRun.prayerStopsIncluded.join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Visual Interactive Route Sequence Timeline */}
              <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#2d2d22] flex items-center gap-2">
                      <Route className="w-5 h-5 text-[#5A5A40]" />
                      Urutan Rute Pengantaran (Waypoints & Timeline)
                    </h3>
                    <p className="text-xs text-[#72725e]">
                      Klik centang pada tiap drop untuk menandai status paket yang telah terkirim secara live.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-[#72725e]">
                    <span className="font-bold text-[#5A5A40]">
                      {Object.values(completedStops).filter(Boolean).length} /{" "}
                      {optimizedRun.waypoints.filter((w) => w.type === "delivery_stop").length} Drop Selesai
                    </span>
                  </div>
                </div>

                {/* Waypoint Steps List */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#5A5A40]/20">
                  {optimizedRun.waypoints.map((waypoint, idx) => {
                    const isDone = completedStops[idx];
                    const isHub =
                      waypoint.type === "hub_origin" ||
                      waypoint.type === "hub_return";
                    const isPrayer = waypoint.type === "prayer_break_station";

                    return (
                      <div key={idx} className="relative group">
                        {/* Step Marker Pin */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            isDone
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : isPrayer
                              ? "bg-amber-100 border-amber-500 text-amber-800"
                              : isHub
                              ? "bg-[#5A5A40] border-[#5A5A40] text-white"
                              : "bg-white border-[#5A5A40] text-[#5A5A40]"
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isPrayer ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <span>{idx}</span>
                          )}
                        </div>

                        {/* Card Content */}
                        <div
                          className={`rounded-2xl p-4 border transition-all ${
                            isDone
                              ? "bg-emerald-50/50 border-emerald-200"
                              : isPrayer
                              ? "bg-amber-50/50 border-amber-200"
                              : isHub
                              ? "bg-[#fbfbfa] border-black/10"
                              : "bg-white border-black/5 hover:border-[#5A5A40]/30 shadow-xs"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40]">
                                  {waypoint.etaTime}
                                </span>

                                <span className="font-serif font-bold text-sm text-[#2d2d22]">
                                  {waypoint.locationName}
                                </span>

                                {waypoint.category && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-[#5A5A40] font-semibold">
                                    {waypoint.category}
                                  </span>
                                )}

                                {waypoint.category?.includes("Cold") && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                                    <ThermometerSnowflake className="w-3 h-3" /> Cold Chain
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#72725e] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#8A8A6A] shrink-0" />
                                {waypoint.address}
                              </p>

                              {waypoint.tenantName && (
                                <div className="text-[11px] text-[#2d2d22] font-semibold pt-1">
                                  Pengirim: <span className="text-[#5A5A40]">{waypoint.tenantName}</span> • Penerima:{" "}
                                  <span className="text-[#2d2d22]">{waypoint.recipientName}</span> ({waypoint.phone})
                                </div>
                              )}

                              {waypoint.specialInstructions && (
                                <p className="text-[11px] text-[#72725e] italic bg-black/2 px-2.5 py-1 rounded-lg mt-1 inline-block">
                                  Instruksi: {waypoint.specialInstructions}
                                </p>
                              )}
                            </div>

                            {/* Distance & Action Column */}
                            <div className="text-right space-y-2 shrink-0">
                              <div className="text-[11px] font-mono text-[#72725e]">
                                {waypoint.distanceFromPrevKm > 0 && (
                                  <div>+{waypoint.distanceFromPrevKm} km ({waypoint.durationFromPrevMin} mnt)</div>
                                )}
                                {waypoint.co2EmittedG > 0 && (
                                  <div className="text-emerald-700">+{waypoint.co2EmittedG}g CO₂</div>
                                )}
                              </div>

                              {waypoint.type === "delivery_stop" && (
                                <button
                                  onClick={() => handleToggleStop(idx)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isDone
                                      ? "bg-emerald-600 text-white"
                                      : "bg-[#f5f2ed] hover:bg-[#5A5A40] hover:text-white text-[#5A5A40]"
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isDone ? "Terkirim & POD Selesai" : "Tandai Terkirim"}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-Tenant Cost Sharing Ledger */}
              <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#2d2d22] flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-[#5A5A40]" />
                      Ledger Bagi Biaya Kolaboratif (Fair Cost-Split)
                    </h3>
                    <p className="text-xs text-[#72725e]">
                      Proporsi pembagian biaya bersama secara adil dan transparan bagi setiap tenant.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-black/10 bg-[#fbfbfa] text-[#72725e]">
                        <th className="py-3 px-4 font-bold">Nama Tenant</th>
                        <th className="py-3 px-4 font-bold">Biaya Normal Sendiri</th>
                        <th className="py-3 px-4 font-bold">Biaya Kolaboratif (Pool)</th>
                        <th className="py-3 px-4 font-bold">Penghematan (Rp)</th>
                        <th className="py-3 px-4 font-bold">Persentase Hemat</th>
                        <th className="py-3 px-4 font-bold">Kontribusi Reduksi CO₂</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {pooledShipments.map((s, idx) => {
                        const savings = s.individualEstimatedCost - s.pooledEstimatedCost;
                        const savingsPct = Math.round((savings / s.individualEstimatedCost) * 100);
                        return (
                          <tr key={idx} className="hover:bg-[#fbfbfa]">
                            <td className="py-3 px-4 font-bold text-[#2d2d22]">
                              {s.tenantName}
                              <div className="text-[10px] text-[#72725e] font-normal">
                                {s.trackingCode} • {s.packageCategory} ({s.weightKg} kg)
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-rose-700">
                              Rp {s.individualEstimatedCost.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#5A5A40]">
                              Rp {s.pooledEstimatedCost.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                              +Rp {savings.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                {savingsPct}% Hemat
                              </span>
                            </td>
                            <td className="py-3 px-4 text-emerald-700 font-semibold font-mono">
                              ~2.1 kg CO₂e
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State / Initial Prompt to Run */
            <div className="bg-white rounded-[24px] border border-black/5 p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center mx-auto">
                <Route className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-serif font-bold text-lg text-[#2d2d22]">
                  Belum Ada Rute yang Dioptimasi
                </h4>
                <p className="text-xs text-[#72725e]">
                  Klik tombol <strong>"Hitung Rute Kolaboratif AI"</strong> di atas untuk memproses urutan pengantaran {selectedShipmentIds.length} paket tenant dan menghasilkan estimasi reduksi emisi serta penghematan biaya.
                </p>
              </div>
              <button
                onClick={handleOptimizeRoutes}
                className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#E4E3DA]" />
                <span>Mulai Optimasi Rute Sekarang</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: REAL-TIME COLLABORATIVE BATCH TRACKING & GPS RADAR MAP         */}
      {/* ========================================================================= */}
      {activeSubTab === "live_tracker" && (
        <LiveBatchMapTracker />
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SHARED PROCUREMENT PORTAL (AGGREGATED SUPPLY ORDERS)           */}
      {/* ========================================================================= */}
      {activeSubTab === "shared_procurement" && (
        <SharedProcurementPortal tenants={tenants} />
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SHIPMENT POOL MANAGER (MANAGE & ADD PACKAGES)                  */}
      {/* ========================================================================= */}
      {activeSubTab === "pool_manager" && (
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-6">
            {/* Header & Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2d2d22]">
                  Daftar Paket dalam Shipping Pool
                </h3>
                <p className="text-xs text-[#72725e]">
                  Centang paket yang ingin digabungkan ke dalam jadwal pengiriman bersama hari ini.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Zone Filter */}
                <div className="flex items-center gap-1.5 text-xs bg-[#fbfbfa] border border-black/10 rounded-full px-3 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <select
                    value={filterZone}
                    onChange={(e) => setFilterZone(e.target.value)}
                    className="bg-transparent text-xs text-[#2d2d22] focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Wilayah</option>
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#72725e] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari penerima / tracking..."
                    className="pl-8 pr-4 py-1.5 text-xs bg-[#fbfbfa] border border-black/10 rounded-full focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                {/* Toggle Select All */}
                <button
                  onClick={() => {
                    if (selectedShipmentIds.length === shipments.length) {
                      setSelectedShipmentIds([]);
                    } else {
                      setSelectedShipmentIds(shipments.map((s) => s.id));
                    }
                  }}
                  className="px-3 py-1.5 bg-[#f5f2ed] hover:bg-[#e8e4dc] text-[#5A5A40] text-xs font-bold rounded-full cursor-pointer transition-all"
                >
                  {selectedShipmentIds.length === shipments.length
                    ? "Batalkan Semua"
                    : "Pilih Semua"}
                </button>
              </div>
            </div>

            {/* Shipments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 bg-[#fbfbfa] text-[#72725e]">
                    <th className="py-3 px-4 font-bold w-8">Pool</th>
                    <th className="py-3 px-4 font-bold">Tracking & Tenant</th>
                    <th className="py-3 px-4 font-bold">Penerima & Alamat</th>
                    <th className="py-3 px-4 font-bold">Kategori & Berat</th>
                    <th className="py-3 px-4 font-bold">Wilayah & Prioritas</th>
                    <th className="py-3 px-4 font-bold">Biaya (Sendiri vs Pool)</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredShipments.map((s) => {
                    const isSelected = selectedShipmentIds.includes(s.id);
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-[#fcfbf9] transition-colors ${
                          isSelected ? "bg-[#f8f7f3]" : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedShipmentIds(
                                  selectedShipmentIds.filter((id) => id !== s.id)
                                );
                              } else {
                                setSelectedShipmentIds([
                                  ...selectedShipmentIds,
                                  s.id,
                                ]);
                              }
                            }}
                            className="rounded text-[#5A5A40] focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-[#5A5A40]">
                            {s.trackingCode}
                          </div>
                          <div className="font-semibold text-[#2d2d22]">
                            {s.tenantName}
                          </div>
                          <div className="text-[10px] text-[#72725e]">
                            Terdaftar: {s.registeredAt}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-[#2d2d22]">
                            {s.recipientName}
                          </div>
                          <div className="text-[11px] text-[#72725e] line-clamp-1">
                            {s.destinationAddress}
                          </div>
                          <div className="text-[10px] text-[#8A8A6A]">
                            Telp: {s.recipientPhone}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#2d2d22]">
                            {s.packageCategory}
                          </div>
                          <div className="text-[11px] text-[#72725e]">
                            {s.weightKg} kg • {s.volumeM3} m³
                          </div>
                          {s.requiresColdChain && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">
                              <ThermometerSnowflake className="w-2.5 h-2.5" /> Cold
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#2d2d22]">
                            {s.zoneLabel}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.priority === "same_day"
                                ? "bg-amber-100 text-amber-800"
                                : s.priority === "next_day"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {s.priority.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-rose-600 line-through text-[11px]">
                            Rp {s.individualEstimatedCost.toLocaleString("id-ID")}
                          </div>
                          <div className="font-mono font-bold text-[#5A5A40]">
                            Rp {s.pooledEstimatedCost.toLocaleString("id-ID")}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-bold">
                            Hemat {Math.round(((s.individualEstimatedCost - s.pooledEstimatedCost) / s.individualEstimatedCost) * 100)}%
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Ready in Hub
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: FLEET & GREEN CARBON METRICS (ESG)                            */}
      {/* ========================================================================= */}
      {activeSubTab === "fleet_carbon" && (
        <div className="space-y-6">
          {/* Fleet Specifications Grid */}
          <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2d2d22] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#5A5A40]" />
                Pilihan Armada Ramah Lingkungan (Green Fleet Roster)
              </h3>
              <p className="text-xs text-[#72725e]">
                Spesifikasi armada hemat energi yang disiapkan untuk melayani rute kolaboratif tenant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VEHICLE_FLEET_OPTIONS.map((f) => {
                const isSelected = f.id === selectedFleetId;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFleetId(f.id)}
                    className={`rounded-2xl p-5 border cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? "bg-[#f8f7f3] border-[#5A5A40] ring-1 ring-[#5A5A40]"
                        : "bg-white border-black/5 hover:border-[#5A5A40]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40]">
                        {f.vehicleType}
                      </span>
                      {f.isElectric ? (
                        <Zap className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Leaf className="w-4 h-4 text-[#8A8A6A]" />
                      )}
                    </div>

                    <div>
                      <div className="font-serif font-bold text-sm text-[#2d2d22]">
                        {f.name}
                      </div>
                      <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                        {f.efficiencyRating}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-[#72725e] border-t border-black/5 pt-2">
                      <div className="flex justify-between">
                        <span>Kapasitas Muat:</span>
                        <span className="font-mono font-bold text-[#2d2d22]">
                          {f.capacityKg} kg / {f.capacityM3} m³
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Faktor Emisi:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {f.emissionFactorGPerKm} g CO₂/km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya / KM:</span>
                        <span className="font-mono text-[#2d2d22]">
                          Rp {f.costPerKm.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#72725e] bg-black/2 p-2 rounded-xl">
                      Zona Rekomendasi: {f.recommendedZone}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carbon Savings & ESG Impact Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#f8faf8] to-[#f0f5f0] rounded-[24px] border border-emerald-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-emerald-950">
                    Sertifikasi Logistik Berkelanjutan (Green ESG)
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Kepatuhan prinsip syariah atas pelestarian lingkungan (Hifdzul Bi'ah).
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-emerald-900 leading-relaxed">
                <p>
                  Dengan menggabungkan paket dari multi-tenant ke dalam satu rute loop terpadu, platform berhasil mengeliminasi hingga <strong>60% perjalanan kosong (deadhead miles)</strong> dan menurunkan emisi gas rumah kaca perkotaan secara terukur.
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 space-y-1.5">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Manfaat bagi Tenant Virtual Office:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800">
                    <li>Klaim sertifikat Green Logistics untuk laporan keberlanjutan tahunan (ESG).</li>
                    <li>Penghematan biaya logistik rutin hingga Rp 2.400.000+ per kuartal.</li>
                    <li>Jaminan penanganan produk halal & cold-chain bersertifikasi amanah.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Delivery Zones Coverage */}
            <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs space-y-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2d2d22]">
                  Cakupan Wilayah & Jaringan Hub
                </h4>
                <p className="text-xs text-[#72725e]">
                  9 Zona Pengantaran Terpadu Jabodetabek dengan basis Sentra Wakaf Islamicity.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DELIVERY_ZONES.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-3 rounded-xl bg-[#fbfbfa] border border-black/5 space-y-1"
                  >
                    <div className="font-bold text-xs text-[#2d2d22]">
                      {zone.name}
                    </div>
                    <div className="text-[10px] text-[#72725e]">
                      ~{zone.avgDistanceKmFromHub} km dari Hub
                    </div>
                    <div className="text-[9px] text-[#8A8A6A] line-clamp-1">
                      {zone.subDistricts.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: DRIVER RUN SHEET & OFFICIAL MANIFEST (POD)                     */}
      {/* ========================================================================= */}
      {activeSubTab === "manifest_pod" && (
        <div className="space-y-6">
          {optimizedRun ? (
            <div className="bg-white rounded-[24px] border border-black/5 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Manifest Print Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#5A5A40] text-white">
                      OFFICIAL DISPATCH MANIFEST
                    </span>
                    <span className="text-xs font-bold text-[#72725e]">
                      {optimizedRun.batchCode}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] mt-1">
                    Surat Jalan & Manifest Pengiriman Kolaboratif
                  </h3>
                  <p className="text-xs text-[#72725e]">
                    Sentra Logistik & Distribusi Syariah Islamicity Virtual Office Hub
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Surat Jalan</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `*MANIFEST DISPATCH LOGISTIK ISLAMICITY*\nBatch: ${optimizedRun.batchCode}\nDriver: ${optimizedRun.driverName}\nTotal Drop: ${optimizedRun.waypoints.filter((w) => w.type === "delivery_stop").length} Lokasi\nTotal Jarak: ${optimizedRun.totalDistanceKm} km\nStatus: Manifest Terkunci & Siap Berangkat.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-2 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Kirim ke WhatsApp Driver</span>
                  </a>
                </div>
              </div>

              {/* Manifest Meta Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#fcfbf9] rounded-2xl border border-black/5 text-xs">
                <div>
                  <span className="text-[#72725e]">Tanggal Dispatch:</span>
                  <div className="font-bold text-[#2d2d22] mt-0.5">
                    {optimizedRun.dispatchDate} ({optimizedRun.departureTime})
                  </div>
                </div>

                <div>
                  <span className="text-[#72725e]">Captain Driver:</span>
                  <div className="font-bold text-[#2d2d22] mt-0.5">
                    {optimizedRun.driverName}
                  </div>
                </div>

                <div>
                  <span className="text-[#72725e]">Armada & Nomor Polisi:</span>
                  <div className="font-bold text-[#2d2d22] mt-0.5">
                    {optimizedRun.vehicle.name} (B 1928 EVI)
                  </div>
                </div>

                <div>
                  <span className="text-[#72725e]">Verifikasi Segel Manifest:</span>
                  <div className="font-mono font-bold text-emerald-800 mt-0.5">
                    {optimizedRun.qrManifestHash}
                  </div>
                </div>
              </div>

              {/* Waypoints Run Sheet Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#fbfbfa] text-[#72725e]">
                      <th className="py-3 px-3 font-bold w-12 text-center">Stop</th>
                      <th className="py-3 px-3 font-bold">Estimasi ETA</th>
                      <th className="py-3 px-3 font-bold">Lokasi / Penerima & Alamat</th>
                      <th className="py-3 px-3 font-bold">Tenant Pengirim & Kargo</th>
                      <th className="py-3 px-3 font-bold">Instruksi Khusus</th>
                      <th className="py-3 px-3 font-bold text-center">Check / TTD Penerima</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {optimizedRun.waypoints.map((w, i) => (
                      <tr key={i} className="hover:bg-[#fbfbfa]">
                        <td className="py-3 px-3 text-center font-bold font-mono">
                          {i === 0 ? "START" : i === optimizedRun.waypoints.length - 1 ? "FINISH" : `#${i}`}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">
                          {w.etaTime}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#2d2d22]">{w.locationName}</div>
                          <div className="text-[11px] text-[#72725e]">{w.address}</div>
                          {w.phone && <div className="text-[10px] text-[#8A8A6A]">Telp: {w.phone}</div>}
                        </td>
                        <td className="py-3 px-3">
                          {w.tenantName ? (
                            <>
                              <div className="font-semibold text-[#2d2d22]">{w.tenantName}</div>
                              <div className="text-[10px] text-[#72725e]">
                                {w.category} ({w.weightKg} kg)
                              </div>
                            </>
                          ) : (
                            <span className="text-[#72725e] italic">- Hub Station -</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#72725e]">
                          {w.specialInstructions || "-"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="w-20 h-10 border border-dashed border-black/20 rounded-lg mx-auto flex items-center justify-center text-[9px] text-black/40">
                            TTD / Cap
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Legal & Verification */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/10 text-xs text-[#72725e]">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-[#5A5A40]" />
                  <div>
                    <div className="font-mono font-bold text-[#2d2d22]">
                      VERIFIED BY ISLAMICITY LOGISTICS ENGINE
                    </div>
                    <div className="text-[10px]">
                      Sistem terenkripsi amanah & bebas klaim emisi fiktif (Certified Green POD).
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px]">
                  <div>Pengawas Logistik: <strong>H. Lukman Hakim, S.T.</strong></div>
                  <div>Dewan Syariah: <strong>KH. Ahmad Fauzan, Lc., M.A.</strong></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-black/5 p-12 text-center shadow-xs space-y-3">
              <FileText className="w-8 h-8 text-[#72725e] mx-auto" />
              <h4 className="font-serif font-bold text-base text-[#2d2d22]">
                Manifest Belum Diterbitkan
              </h4>
              <p className="text-xs text-[#72725e] max-w-sm mx-auto">
                Silakan lakukan optimasi rute pada tab <strong>"1. Dispatch Optimizer"</strong> terlebih dahulu untuk menerbitkan surat jalan resmi dan manifest digital.
              </p>
              <button
                onClick={() => setActiveSubTab("optimizer")}
                className="px-5 py-2 bg-[#5A5A40] text-white text-xs font-bold rounded-full cursor-pointer"
              >
                Buka Dispatch Optimizer
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DAFTARKAN PAKET PENGIRIMAN TENANT BARU                             */}
      {/* ========================================================================= */}
      {isAddShipmentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10 my-8">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40]">
                  FORMULIR SHIPMENT POOL
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2d2d22] mt-0.5">
                  Daftarkan Paket Pengiriman Tenant Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddShipmentOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#72725e] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddShipment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tenant Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2d2d22]">
                    Tenant Pengirim
                  </label>
                  <select
                    value={newTenantId}
                    onChange={(e) => setNewTenantId(e.target.value)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.companyName} ({t.businessType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2d2d22]">
                    Kategori Kargo
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  >
                    <option value="Halal F&B / Frozen">Halal F&B / Frozen Pack</option>
                    <option value="Herbal & Skincare">Herbal & Kosmetik Syariah</option>
                    <option value="Dokumen & Arsip Legal">Dokumen & Arsip Legal</option>
                    <option value="Modest Fashion / Apparel">Modest Fashion / Apparel</option>
                    <option value="Paket Wakaf / Sembako">Paket Wakaf / Bantuan Dhuafa</option>
                    <option value="Elektronik & Gadget">Elektronik & Gadget Bisnis</option>
                  </select>
                </div>

                {/* Recipient Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2d2d22]">
                    Nama Penerima / Perusahaan Tujuan
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                    placeholder="Contoh: Toko Berkah Mandiri / Bpk. Fajar"
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                {/* Recipient Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2d2d22]">
                    Nomor WhatsApp Penerima
                  </label>
                  <input
                    type="text"
                    value={newRecipientPhone}
                    onChange={(e) => setNewRecipientPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Destination Address & Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[#2d2d22]">
                    Alamat Lengkap Tujuan
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Jl. Thamrin No. 10, Gedung B lt. 4..."
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2d2d22]">
                    Wilayah / Zona
                  </label>
                  <select
                    value={newZone}
                    onChange={(e: any) => setNewZone(e.target.value)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2.5 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                  >
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dimensions & Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2d2d22]">
                    Berat (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newWeightKg}
                    onChange={(e) => setNewWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2d2d22]">
                    Volume (M³)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newVolumeM3}
                    onChange={(e) => setNewVolumeM3(parseFloat(e.target.value) || 0.01)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2d2d22]">
                    Nilai Barang (Rp)
                  </label>
                  <input
                    type="number"
                    value={newDeclaredValue}
                    onChange={(e) => setNewDeclaredValue(parseInt(e.target.value) || 0)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2d2d22]">
                    Prioritas
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-2 py-2 text-[#2d2d22]"
                  >
                    <option value="same_day">Same Day</option>
                    <option value="next_day">Next Day</option>
                    <option value="eco_standard">Eco Standard</option>
                  </select>
                </div>
              </div>

              {/* Cold-chain & Fragile checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequiresColdChain}
                    onChange={(e) => setNewRequiresColdChain(e.target.checked)}
                    className="rounded text-[#5A5A40] focus:ring-0 w-4 h-4"
                  />
                  <span className="font-semibold text-[#2d2d22]">
                    Butuh Cold-Chain / Insulated Box
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsFragile}
                    onChange={(e) => setNewIsFragile(e.target.checked)}
                    className="rounded text-[#5A5A40] focus:ring-0 w-4 h-4"
                  />
                  <span className="font-semibold text-[#2d2d22]">
                    Barang Pecah Belah / Fragile
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsAddShipmentOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-[#72725e] hover:bg-black/5 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#5A5A40] hover:bg-[#484833] text-white shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Masukkan ke Pool Pengiriman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
