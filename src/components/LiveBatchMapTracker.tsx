import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapPin,
  Truck,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  BatteryCharging,
  ThermometerSnowflake,
  Wind,
  ShieldCheck,
  Phone,
  MessageSquare,
  AlertTriangle,
  Layers,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Sparkles,
  Leaf,
  DollarSign,
  Building,
  Check,
  ArrowRight,
  Sun,
  Moon,
  Compass,
  Radio,
  FileCheck2,
} from "lucide-react";
import {
  CollaborativeTrackingBatch,
  RouteWaypoint,
  LiveTrackingLog,
  LogisticsShipment,
} from "../types";
import { INITIAL_COLLABORATIVE_BATCHES } from "../data/batchTrackingData";

interface LiveBatchMapTrackerProps {
  onSelectShipment?: (shipmentId: string) => void;
}

export const LiveBatchMapTracker: React.FC<LiveBatchMapTrackerProps> = () => {
  const [batches, setBatches] = useState<CollaborativeTrackingBatch[]>(
    INITIAL_COLLABORATIVE_BATCHES
  );
  const [activeBatchId, setActiveBatchId] = useState<string>("batch-clb-081");

  // Selected stop in map inspector
  const [selectedWaypoint, setSelectedWaypoint] =
    useState<RouteWaypoint | null>(null);

  // Map view styling
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [showTrafficOverlay, setShowTrafficOverlay] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Live GPS Simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);

  // Proof of delivery modal
  const [podModalStop, setPodModalStop] = useState<RouteWaypoint | null>(null);
  const [recipientSignature, setRecipientSignature] = useState<string>(
    "Telah Diterima Sesuai SOP Syariah"
  );
  const [podSuccessToast, setPodSuccessToast] = useState<string | null>(null);

  // Active batch object
  const activeBatch = useMemo(() => {
    return (
      batches.find((b) => b.id === activeBatchId) ||
      batches[0] ||
      INITIAL_COLLABORATIVE_BATCHES[0]
    );
  }, [batches, activeBatchId]);

  // Set default selected waypoint when batch changes
  useEffect(() => {
    if (activeBatch && activeBatch.waypoints.length > 0) {
      const current =
        activeBatch.waypoints[activeBatch.currentStopIndex] ||
        activeBatch.waypoints[1] ||
        activeBatch.waypoints[0];
      setSelectedWaypoint(current);
    }
  }, [activeBatchId]);

  // Map projection helpers for Jabodetabek coordinates
  // Lat: -6.33 to -6.14 (South to North)
  // Lng: 106.66 to 106.94 (West to East)
  const mapBounds = {
    minLat: -6.32,
    maxLat: -6.14,
    minLng: 106.69,
    maxLng: 106.93,
  };

  const projectToSvg = (lat: number, lng: number) => {
    const width = 840;
    const height = 580;
    const padding = 50;

    // Normalizing
    const xPct = (lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng);
    // Invert Y because latitude goes negative downward
    const yPct = (mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat);

    const x = padding + xPct * (width - padding * 2);
    const y = padding + yPct * (height - padding * 2);

    return { x: Math.round(x), y: Math.round(y) };
  };

  // Convert waypoints into SVG coordinates
  const projectedWaypoints = useMemo(() => {
    return activeBatch.waypoints.map((wp) => {
      const pt = projectToSvg(wp.lat, wp.lng);
      return {
        ...wp,
        svgX: pt.x,
        svgY: pt.y,
      };
    });
  }, [activeBatch]);

  // Current vehicle SVG coordinates
  const vehicleSvgPos = useMemo(() => {
    return projectToSvg(
      activeBatch.currentPosition.lat,
      activeBatch.currentPosition.lng
    );
  }, [activeBatch.currentPosition]);

  // SVG Path for the complete route polyline
  const routePathD = useMemo(() => {
    if (projectedWaypoints.length < 2) return "";
    let d = `M ${projectedWaypoints[0].svgX} ${projectedWaypoints[0].svgY}`;
    for (let i = 1; i < projectedWaypoints.length; i++) {
      const prev = projectedWaypoints[i - 1];
      const curr = projectedWaypoints[i];
      // Subtle curved bezier line for natural roadway curve
      const midX = (prev.svgX + curr.svgX) / 2;
      const midY = (prev.svgY + curr.svgY) / 2 - 10;
      d += ` Q ${midX} ${midY} ${curr.svgX} ${curr.svgY}`;
    }
    return d;
  }, [projectedWaypoints]);

  // Simulated GPS movement loop
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimStep((prev) => prev + 1);

        setBatches((prevBatches) =>
          prevBatches.map((batch) => {
            if (batch.id !== activeBatchId || batch.status === "completed") {
              return batch;
            }

            // Move vehicle towards next stop
            const waypoints = batch.waypoints;
            const currentIdx = batch.currentStopIndex;
            const targetWp = waypoints[currentIdx];

            if (!targetWp) return batch;

            const dLat = (targetWp.lat - batch.currentPosition.lat) * 0.15;
            const dLng = (targetWp.lng - batch.currentPosition.lng) * 0.15;

            const newLat = Number((batch.currentPosition.lat + dLat).toFixed(5));
            const newLng = Number((batch.currentPosition.lng + dLng).toFixed(5));

            // Check distance
            const distRemaining = Math.hypot(
              targetWp.lat - newLat,
              targetWp.lng - newLng
            );

            // Telemetry random fluctuations for live realism
            const randomSpeed = Math.floor(32 + Math.random() * 18);
            const randomTemp = Number((3.6 + Math.random() * 0.6).toFixed(1));
            const newBattery = Math.max(
              20,
              batch.telemetry.batteryPercent - (Math.random() > 0.7 ? 1 : 0)
            );

            // If close enough to target waypoint, mark completed and advance
            if (distRemaining < 0.003) {
              const updatedWaypoints = waypoints.map((w, i) =>
                i === currentIdx ? { ...w, isCompleted: true } : w
              );

              const nextIdx = currentIdx + 1;
              const isFinished = nextIdx >= waypoints.length;

              const arrivalLog: LiveTrackingLog = {
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " WIB",
                event: isFinished
                  ? `Armada kembali ke Hub Menteng (Selesai).`
                  : targetWp.type === "prayer_break_station"
                  ? `Tiba di Jeda Ibadah: ${targetWp.locationName}`
                  : `Tiba di ${targetWp.locationName} (${targetWp.tenantName || ""})`,
                type:
                  targetWp.type === "prayer_break_station"
                    ? "prayer_break"
                    : "waypoint_reached",
                notes:
                  targetWp.type === "prayer_break_station"
                    ? "Shalat fardhu berjamaah dan evaluasi suhu kargo."
                    : `Selesai verifikasi drop muatan ${targetWp.weightKg || 5} kg.`,
              };

              return {
                ...batch,
                waypoints: updatedWaypoints,
                currentStopIndex: isFinished ? currentIdx : nextIdx,
                status: isFinished ? "completed" : batch.status,
                currentPosition: {
                  lat: targetWp.lat,
                  lng: targetWp.lng,
                  nearestRoad: targetWp.address,
                  headingDeg: (batch.currentPosition.headingDeg + 45) % 360,
                },
                telemetry: {
                  ...batch.telemetry,
                  currentSpeedKmH: isFinished ? 0 : randomSpeed,
                  cargoTempCelsius: randomTemp,
                  batteryPercent: newBattery,
                  lastGpsPingTime: "Baru saja",
                },
                logs: [arrivalLog, ...batch.logs],
              };
            }

            return {
              ...batch,
              currentPosition: {
                ...batch.currentPosition,
                lat: newLat,
                lng: newLng,
              },
              telemetry: {
                ...batch.telemetry,
                currentSpeedKmH: randomSpeed,
                cargoTempCelsius: randomTemp,
                batteryPercent: newBattery,
                lastGpsPingTime: "2 detik lalu",
              },
            };
          })
        );
      }, 2400);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, activeBatchId]);

  // Handle Mark Current Drop as Completed with POD
  const handleConfirmPOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podModalStop) return;

    setBatches((prev) =>
      prev.map((b) => {
        if (b.id !== activeBatchId) return b;

        const updatedWps = b.waypoints.map((w) =>
          w.stopIndex === podModalStop.stopIndex ? { ...w, isCompleted: true } : w
        );

        const newLog: LiveTrackingLog = {
          id: `pod-log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }) + " WIB",
          event: `Proof of Delivery: ${podModalStop.locationName} Sah Diterima`,
          type: "proof_of_delivery",
          notes: `Diverifikasi oleh ${podModalStop.recipientName || "Penerima"}. Catatan: ${recipientSignature}. Notifikasi otomatis terkirim ke WhatsApp tenant.`,
        };

        const nextStop = Math.min(b.waypoints.length - 1, b.currentStopIndex + 1);

        return {
          ...b,
          waypoints: updatedWps,
          currentStopIndex: nextStop,
          podSignaturesCount: b.podSignaturesCount + 1,
          logs: [newLog, ...b.logs],
        };
      })
    );

    setPodSuccessToast(
      `POD Berhasil! Stop "${podModalStop.locationName}" telah ditandai selesai dan tanda terima digital telah disimpan.`
    );
    setTimeout(() => setPodSuccessToast(null), 5000);
    setPodModalStop(null);
  };

  // Google Maps external link generator
  const getGoogleMapsDirectionsUrl = (batch: CollaborativeTrackingBatch) => {
    const origin = encodeURIComponent(batch.waypoints[0]?.address || "Menteng Jakarta");
    const destination = encodeURIComponent(
      batch.waypoints[batch.waypoints.length - 1]?.address || "Menteng Jakarta"
    );
    const waypointsParam = batch.waypoints
      .slice(1, -1)
      .map((w) => `${w.lat},${w.lng}`)
      .join("|");

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(
      waypointsParam
    )}&travelmode=driving`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-Time Batch Selector & Live Telemetry Ribbons */}
      <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Live Collaborative Fleet Radar
              </span>
              <span className="text-[10px] text-gray-400">• GPS Frekuensi 1 Hz</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2d2d22] mt-0.5">
              Peta Pelacakan Pengiriman Kolaboratif Real-Time
            </h3>
            <p className="text-xs text-[#72725e]">
              Visualisasi posisi armada terpadu, sensor suhu cold-chain, status per-stop tenant, dan jeda ibadah shalat fardhu pengemudi.
            </p>
          </div>

          {/* Batch Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {batches.map((batch) => {
              const isActive = batch.id === activeBatchId;
              const isMoving = batch.status === "in_transit";
              return (
                <button
                  key={batch.id}
                  onClick={() => setActiveBatchId(batch.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#5A5A40] text-white shadow-xs"
                      : "bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e8e4dc]"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{batch.batchCode}</span>
                  {isMoving && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Telemetry Sensor Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Speedometer */}
          <div className="bg-[#fcfbf9] rounded-2xl p-3 border border-black/5">
            <div className="text-[10px] text-[#72725e] flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#5A5A40]" /> Kecepatan
            </div>
            <div className="text-lg font-bold font-mono text-[#2d2d22] mt-0.5">
              {activeBatch.telemetry.currentSpeedKmH}{" "}
              <span className="text-xs font-normal text-gray-500">km/jam</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">
              Trafik: {activeBatch.telemetry.trafficStatus}
            </div>
          </div>

          {/* EV Battery / Fuel Level */}
          <div className="bg-[#fcfbf9] rounded-2xl p-3 border border-black/5">
            <div className="text-[10px] text-[#72725e] flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-emerald-600" /> Baterai EV
            </div>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {activeBatch.telemetry.batteryPercent}%
            </div>
            <div className="text-[10px] text-[#72725e]">
              Sisa Range ~{activeBatch.telemetry.estimatedRemainingKm} km
            </div>
          </div>

          {/* Cold-Chain Temp Sensor */}
          <div className="bg-[#fcfbf9] rounded-2xl p-3 border border-black/5">
            <div className="text-[10px] text-[#72725e] flex items-center gap-1">
              <ThermometerSnowflake className="w-3 h-3 text-sky-600" /> Suhu Kargo
            </div>
            <div className="text-lg font-bold font-mono text-sky-700 mt-0.5">
              {activeBatch.telemetry.cargoTempCelsius}°C
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold">
              ✓ Halal Chilled Optimal
            </div>
          </div>

          {/* Current Waypoint Progress */}
          <div className="bg-[#fcfbf9] rounded-2xl p-3 border border-black/5">
            <div className="text-[10px] text-[#72725e] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" /> Posisi Stop
            </div>
            <div className="text-lg font-bold font-mono text-[#2d2d22] mt-0.5">
              {activeBatch.currentStopIndex} / {activeBatch.waypoints.length - 1}
            </div>
            <div className="text-[10px] text-[#72725e] truncate">
              {activeBatch.waypoints[activeBatch.currentStopIndex]?.locationName ||
                "Hub Sentral"}
            </div>
          </div>

          {/* Cost Savings from Pooling */}
          <div className="bg-[#fcfbf9] rounded-2xl p-3 border border-black/5">
            <div className="text-[10px] text-[#72725e] flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-600" /> Hemat Bersama
            </div>
            <div className="text-base font-bold font-mono text-amber-800 mt-0.5 truncate">
              Rp {activeBatch.costSavedTotal.toLocaleString("id-ID")}
            </div>
            <div className="text-[10px] text-[#72725e]">
              Hemat ~54% vs Kirim Sendiri
            </div>
          </div>

          {/* Carbon Footprint Reduction */}
          <div className="bg-[#fcfbf9] rounded-2xl p-3 border border-black/5">
            <div className="text-[10px] text-[#72725e] flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-600" /> Emisi Ditekan
            </div>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {activeBatch.co2AvoidedKg} kg
            </div>
            <div className="text-[10px] text-[#72725e]">
              ~{(activeBatch.co2AvoidedKg * 0.05).toFixed(1)} Bibit Pohon
            </div>
          </div>
        </div>
      </div>

      {podSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold flex-1">{podSuccessToast}</div>
        </div>
      )}

      {/* Main Interactive Map & Inspector Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Map Canvas (Takes 2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[24px] border border-black/5 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[520px]">
            {/* Map Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 z-10 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-black/5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2d2d22] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#5A5A40]" />
                  {activeBatch.corridorName}
                </span>
                <span className="text-[11px] font-mono text-gray-500 bg-black/5 px-2 py-0.5 rounded-md">
                  Armada: {activeBatch.vehicle.name}
                </span>
              </div>

              {/* Map Layer and Simulation Controls */}
              <div className="flex items-center gap-1.5">
                {/* Simulation Play/Pause Button */}
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSimulating
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs animate-pulse"
                      : "bg-[#5A5A40] hover:bg-[#484833] text-white shadow-xs"
                  }`}
                  title={
                    isSimulating
                      ? "Jeda Simulasi GPS"
                      : "Mulai Animasi Simulasi Live GPS"
                  }
                >
                  {isSimulating ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda GPS</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Simulasikan GPS</span>
                    </>
                  )}
                </button>

                {/* Map Theme Toggle */}
                <button
                  onClick={() =>
                    setMapTheme(mapTheme === "light" ? "dark" : "light")
                  }
                  className="p-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#5A5A40] transition-colors cursor-pointer"
                  title="Ganti Mode Peta (Terang / Gelap)"
                >
                  {mapTheme === "light" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </button>

                {/* Traffic Overlay Toggle */}
                <button
                  onClick={() => setShowTrafficOverlay(!showTrafficOverlay)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
                    showTrafficOverlay
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-white border-black/10 text-gray-600"
                  }`}
                  title="Toggle Lapisan Trafik Lalu Lintas"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Trafik</span>
                </button>

                {/* Open in Google Maps */}
                <a
                  href={getGoogleMapsDirectionsUrl(activeBatch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-blue-600 transition-colors"
                  title="Buka Rute di Google Maps Eksternal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* SVG Interactive Map Area */}
            <div
              className={`relative w-full h-[460px] rounded-2xl overflow-hidden mt-3 transition-colors duration-300 select-none ${
                mapTheme === "dark" ? "bg-[#181C16]" : "bg-[#F3F4EE]"
              }`}
            >
              {/* SVG Canvas */}
              <svg
                viewBox="0 0 840 580"
                className="w-full h-full cursor-grab active:cursor-grabbing"
              >
                {/* Background Grid Pattern */}
                <defs>
                  <pattern
                    id="grid-pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke={
                        mapTheme === "dark"
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.04)"
                      }
                      strokeWidth="1"
                    />
                  </pattern>

                  {/* Linear gradient for polyline */}
                  <linearGradient
                    id="route-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8A9A65" />
                    <stop offset="50%" stopColor="#5A5A40" />
                    <stop offset="100%" stopColor="#3E4733" />
                  </linearGradient>

                  {/* Pulsing Sonar Filter */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Base grid fill */}
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                {/* Stylized Jabodetabek Geography Shapes (Coastline & Rivers) */}
                {/* Java Sea / Teluk Jakarta on top */}
                <path
                  d="M 0,0 L 840,0 L 840,65 Q 600,90 420,70 Q 240,55 0,80 Z"
                  fill={mapTheme === "dark" ? "#101614" : "#D4E6EB"}
                  opacity="0.8"
                />
                <text
                  x="700"
                  y="45"
                  fill={mapTheme === "dark" ? "#445550" : "#7BA3B0"}
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="2"
                >
                  TELUK JAKARTA
                </text>

                {/* Ciliwung River Curve */}
                <path
                  d="M 520,70 Q 490,180 470,270 T 450,420 T 430,580"
                  fill="none"
                  stroke={mapTheme === "dark" ? "#1e2c26" : "#BFDDE6"}
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Urban District Labels */}
                <g
                  fill={
                    mapTheme === "dark"
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(0,0,0,0.18)"
                  }
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  letterSpacing="1.5"
                >
                  <text x="390" y="150">
                    JAKARTA PUSAT
                  </text>
                  <text x="420" y="320">
                    JAKARTA SELATAN
                  </text>
                  <text x="180" y="240">
                    JAKARTA BARAT
                  </text>
                  <text x="630" y="230">
                    JAKARTA TIMUR
                  </text>
                  <text x="520" y="115">
                    JAKARTA UTARA
                  </text>
                  <text x="80" y="440">
                    TANGERANG & BSD
                  </text>
                  <text x="700" y="420">
                    BEKASI RAYA
                  </text>
                </g>

                {/* Arterial Road Network Lines */}
                <g
                  stroke={
                    mapTheme === "dark"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)"
                  }
                  strokeWidth="3"
                  fill="none"
                  strokeLinejoin="round"
                >
                  {/* Tol Dalam Kota Loop */}
                  <ellipse cx="440" cy="240" rx="180" ry="110" />
                  {/* Tol JORR Outer Loop */}
                  <ellipse cx="440" cy="300" rx="320" ry="190" strokeDasharray="6,4" />
                  {/* Sudirman - Thamrin Axis */}
                  <line x1="430" y1="120" x2="400" y2="340" strokeWidth="5" />
                  {/* Gatot Subroto */}
                  <line x1="260" y1="280" x2="620" y2="250" strokeWidth="4" />
                  {/* Rasuna Said */}
                  <line x1="450" y1="190" x2="465" y2="310" strokeWidth="4" />
                  {/* Tol Merak - Tangerang */}
                  <line x1="100" y1="260" x2="360" y2="220" strokeWidth="4" />
                </g>

                {/* Traffic Overlay (if enabled) */}
                {showTrafficOverlay && (
                  <g fill="none" strokeWidth="3" opacity="0.6">
                    {/* Lancar (Green) */}
                    <path
                      d="M 430,120 L 415,220"
                      stroke="#10b981"
                      strokeDasharray="4,2"
                    />
                    <path
                      d="M 450,190 L 460,260"
                      stroke="#10b981"
                      strokeDasharray="4,2"
                    />
                    {/* Padat Merayap (Amber) */}
                    <path
                      d="M 415,220 L 400,310"
                      stroke="#f59e0b"
                      strokeWidth="4"
                    />
                    {/* Macet Simpang (Red) */}
                    <path
                      d="M 330,270 L 370,265"
                      stroke="#ef4444"
                      strokeWidth="4"
                    />
                  </g>
                )}

                {/* Main Collaborative Route Polyline */}
                {routePathD && (
                  <>
                    {/* Outer Glow */}
                    <path
                      d={routePathD}
                      fill="none"
                      stroke="#5A5A40"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.25"
                    />
                    {/* Core Line */}
                    <path
                      d={routePathD}
                      fill="none"
                      stroke="url(#route-gradient)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Animated Route Flow Dashes */}
                    <path
                      d={routePathD}
                      fill="none"
                      stroke="#E4E3DA"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="8,16"
                      className="animate-[dash_20s_linear_infinite]"
                    />
                  </>
                )}

                {/* Waypoints Pins */}
                {projectedWaypoints.map((wp) => {
                  const isSelected = selectedWaypoint?.stopIndex === wp.stopIndex;
                  const isCurrent = activeBatch.currentStopIndex === wp.stopIndex;
                  const isOrigin = wp.type === "hub_origin";
                  const isReturn = wp.type === "hub_return";
                  const isPrayer = wp.type === "prayer_break_station";

                  return (
                    <g
                      key={wp.stopIndex}
                      transform={`translate(${wp.svgX}, ${wp.svgY})`}
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => setSelectedWaypoint(wp)}
                    >
                      {/* Pulse circle for active stop */}
                      {isCurrent && (
                        <circle
                          r="18"
                          fill="#f59e0b"
                          opacity="0.3"
                          className="animate-ping"
                        />
                      )}

                      {/* Selection indicator ring */}
                      {isSelected && (
                        <circle
                          r="16"
                          fill="none"
                          stroke={mapTheme === "dark" ? "#ffffff" : "#2d2d22"}
                          strokeWidth="2.5"
                        />
                      )}

                      {/* Pin Circle Body */}
                      <circle
                        r={isOrigin || isReturn ? "13" : isPrayer ? "12" : "11"}
                        fill={
                          isOrigin || isReturn
                            ? "#2d3325"
                            : isPrayer
                            ? "#059669"
                            : wp.isCompleted
                            ? "#10b981"
                            : isCurrent
                            ? "#d97706"
                            : "#64748b"
                        }
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="shadow-md"
                      />

                      {/* Icon or Stop Number inside pin */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={isPrayer ? "9" : "10"}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {isOrigin
                          ? "★"
                          : isReturn
                          ? "↺"
                          : isPrayer
                          ? "🕌"
                          : wp.isCompleted
                          ? "✓"
                          : wp.stopIndex}
                      </text>

                      {/* Floating Location Tooltip Label */}
                      <g
                        transform="translate(0, -18)"
                        className="pointer-events-none"
                      >
                        <rect
                          x="-45"
                          y="-14"
                          width="90"
                          height="16"
                          rx="4"
                          fill={
                            mapTheme === "dark"
                              ? "rgba(20,20,20,0.85)"
                              : "rgba(255,255,255,0.92)"
                          }
                          stroke={
                            mapTheme === "dark"
                              ? "rgba(255,255,255,0.15)"
                              : "rgba(0,0,0,0.12)"
                          }
                          strokeWidth="0.5"
                        />
                        <text
                          x="0"
                          y="-3"
                          textAnchor="middle"
                          fill={mapTheme === "dark" ? "#f3f4ee" : "#2d2d22"}
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {isPrayer
                            ? "Jeda Shalat"
                            : isOrigin
                            ? "Hub Menteng"
                            : isReturn
                            ? "Return Hub"
                            : `Stop #${wp.stopIndex}`}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Animated Vehicle / Fleet Marker */}
                <g
                  transform={`translate(${vehicleSvgPos.x}, ${vehicleSvgPos.y})`}
                  className="transition-all duration-700 ease-linear cursor-pointer"
                  onClick={() =>
                    setSelectedWaypoint(
                      activeBatch.waypoints[activeBatch.currentStopIndex]
                    )
                  }
                >
                  {/* Radar Wave rings */}
                  <circle
                    r="24"
                    fill="#10b981"
                    opacity="0.15"
                    className="animate-ping"
                  />
                  <circle
                    r="16"
                    fill="#5A5A40"
                    opacity="0.25"
                    className="animate-pulse"
                  />

                  {/* Vehicle Body Box */}
                  <rect
                    x="-14"
                    y="-12"
                    width="28"
                    height="24"
                    rx="6"
                    fill="#2D3325"
                    stroke="#E4E3DA"
                    strokeWidth="2"
                    filter="url(#glow)"
                  />

                  {/* Vehicle Icon Symbol */}
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#E4E3DA"
                    fontSize="11"
                  >
                    🚐
                  </text>

                  {/* Live Fleet Tag */}
                  <g transform="translate(0, 22)">
                    <rect
                      x="-40"
                      y="0"
                      width="80"
                      height="16"
                      rx="4"
                      fill="#10b981"
                    />
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {activeBatch.telemetry.currentSpeedKmH} km/h • EV
                    </text>
                  </g>
                </g>
              </svg>

              {/* Map Floating Legend (Bottom Left) */}
              <div
                className={`absolute bottom-3 left-3 p-3 rounded-xl backdrop-blur-xs text-[10px] space-y-1 border shadow-xs ${
                  mapTheme === "dark"
                    ? "bg-black/60 border-white/10 text-gray-300"
                    : "bg-white/80 border-black/10 text-gray-700"
                }`}
              >
                <div className="font-bold uppercase tracking-wider text-[9px] mb-1">
                  Legenda Peta
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2d3325]"></span>
                  <span>Hub Sentral Islamicity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                  <span>Stop Selesai / Terverifikasi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] animate-pulse"></span>
                  <span>Stop Berjalan / Menuju Lokasi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                  <span>Jeda Shalat Fardhu (Masjid)</span>
                </div>
              </div>
            </div>

            {/* Bottom Map Quick Stats & Nearest Road Status */}
            <div className="mt-3 pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#72725e]">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>
                  Posisi GPS:{" "}
                  <strong className="text-[#2d2d22]">
                    {activeBatch.currentPosition.nearestRoad}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[#72725e]">
                  Progres Rute:{" "}
                  <strong className="font-mono text-[#5A5A40]">
                    {activeBatch.completedDistanceKm} /{" "}
                    {activeBatch.totalDistanceKm} km
                  </strong>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  POD: {activeBatch.podSignaturesCount} Tanda Terima
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Waypoint Inspector & Live Dispatch Actions */}
        <div className="space-y-4">
          {/* Waypoint Inspector Card */}
          {selectedWaypoint ? (
            <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-black/5 pb-3">
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      selectedWaypoint.isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : activeBatch.currentStopIndex ===
                          selectedWaypoint.stopIndex
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedWaypoint.isCompleted
                      ? "✓ Selesai Terkirim"
                      : activeBatch.currentStopIndex ===
                        selectedWaypoint.stopIndex
                      ? "Sedang Menuju Titik"
                      : "Dalam Antrean"}
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#2d2d22] mt-1.5 leading-snug">
                    {selectedWaypoint.locationName}
                  </h4>
                  <p className="text-xs text-[#72725e] mt-0.5">
                    {selectedWaypoint.address}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#fcfbf9] px-2.5 py-1 rounded-xl border border-black/5">
                    ETA {selectedWaypoint.etaTime}
                  </span>
                </div>
              </div>

              {/* Waypoint Details Grid */}
              <div className="space-y-2 text-xs">
                {selectedWaypoint.tenantName && (
                  <div className="flex items-center justify-between p-2 bg-[#fcfbf9] rounded-xl border border-black/5">
                    <span className="text-[#72725e]">Tenant Pengirim:</span>
                    <span className="font-bold text-[#2d2d22]">
                      {selectedWaypoint.tenantName}
                    </span>
                  </div>
                )}

                {selectedWaypoint.recipientName && (
                  <div className="flex items-center justify-between p-2 bg-[#fcfbf9] rounded-xl border border-black/5">
                    <span className="text-[#72725e]">Penerima & Kontak:</span>
                    <span className="font-medium text-[#2d2d22]">
                      {selectedWaypoint.recipientName}{" "}
                      {selectedWaypoint.phone && `(${selectedWaypoint.phone})`}
                    </span>
                  </div>
                )}

                {selectedWaypoint.category && (
                  <div className="flex items-center justify-between p-2 bg-[#fcfbf9] rounded-xl border border-black/5">
                    <span className="text-[#72725e]">Kategori Kargo:</span>
                    <span className="font-semibold text-[#5A5A40]">
                      {selectedWaypoint.category} (
                      {selectedWaypoint.weightKg || 5} kg)
                    </span>
                  </div>
                )}

                {selectedWaypoint.specialInstructions && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    <strong className="block text-amber-950 font-semibold mb-0.5">
                      Instruksi Khusus / Amanah Kurir:
                    </strong>
                    {selectedWaypoint.specialInstructions}
                  </div>
                )}
              </div>

              {/* Action Buttons for this Waypoint */}
              <div className="pt-2 flex flex-col gap-2">
                {!selectedWaypoint.isCompleted &&
                  selectedWaypoint.type === "delivery_stop" && (
                    <button
                      onClick={() => setPodModalStop(selectedWaypoint)}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Konfirmasi Tanda Terima POD Digital</span>
                    </button>
                  )}

                {selectedWaypoint.phone && (
                  <a
                    href={`https://wa.me/${selectedWaypoint.phone.replace(
                      /[^0-9]/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-white hover:bg-black/5 border border-black/10 text-[#5A5A40] rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Penerima</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-black/5 p-6 shadow-xs text-center text-xs text-[#72725e]">
              Pilih waypoint pada peta untuk melihat detail pengantaran.
            </div>
          )}

          {/* Captain Driver Card & Contact */}
          <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#72725e] uppercase tracking-wider">
                Captain Armada Bertugas
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Eco-Certified
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-sm">
                RH
              </div>
              <div className="flex-1">
                <div className="font-serif font-bold text-sm text-[#2d2d22]">
                  {activeBatch.driverName}
                </div>
                <div className="text-xs text-[#72725e]">
                  {activeBatch.driverPhone} • {activeBatch.vehicle.name}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={`tel:${activeBatch.driverPhone}`}
                className="flex-1 py-2 bg-[#fcfbf9] hover:bg-[#f5f2ed] border border-black/10 rounded-full text-xs font-bold text-[#2d2d22] flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Telepon</span>
              </a>
              <a
                href={`https://wa.me/${activeBatch.driverPhone.replace(
                  /[^0-9]/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Live Activity & Milestone Log */}
          <div className="bg-white rounded-[24px] border border-black/5 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-[#2d2d22] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#5A5A40]" />
                Log Audit & Kronologi Perjalanan
              </h4>
              <span className="text-[10px] text-[#72725e]">Real-time Sync</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {activeBatch.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-[#fcfbf9] rounded-xl border border-black/5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#5A5A40]">
                      {log.timestamp}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        log.type === "proof_of_delivery"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.type === "prayer_break"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {log.type === "proof_of_delivery"
                        ? "POD Sah"
                        : log.type === "prayer_break"
                        ? "Ibadah"
                        : "Info"}
                    </span>
                  </div>
                  <div className="font-semibold text-[#2d2d22]">{log.event}</div>
                  {log.notes && (
                    <div className="text-[11px] text-[#72725e] leading-snug">
                      {log.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Proof of Delivery (POD) Modal */}
      {podModalStop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-black/5 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                  Konfirmasi Pengantaran Selesai
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2d2d22] mt-1">
                  Surat Tanda Terima Digital (POD)
                </h3>
                <p className="text-xs text-[#72725e]">
                  {podModalStop.locationName}
                </p>
              </div>

              <button
                onClick={() => setPodModalStop(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPOD} className="space-y-4 text-xs">
              <div className="bg-[#fcfbf9] rounded-xl p-3 border border-black/5 space-y-1">
                <div className="text-[#72725e]">Penerima Terdaftar:</div>
                <div className="font-bold text-[#2d2d22]">
                  {podModalStop.recipientName} ({podModalStop.phone})
                </div>
                <div className="text-[11px] text-[#5A5A40]">
                  Barang: {podModalStop.category} ({podModalStop.weightKg} kg)
                </div>
              </div>

              {/* Signature simulation pad */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2d2d22]">
                  Tanda Tangan / Verifikasi Penerima
                </label>
                <div className="w-full h-24 bg-white border border-dashed border-black/20 rounded-xl p-3 flex flex-col items-center justify-center relative">
                  <span className="text-3xl font-serif text-[#5A5A40]/40 italic select-none">
                    {podModalStop.recipientName?.split(" ")[0] || "TandaTangan"}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-2">
                    ✓ Terverifikasi via OTP / Tanda Tangan Digital Amanah
                  </div>
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2d2d22]">
                  Catatan Kondisi Barang
                </label>
                <input
                  type="text"
                  value={recipientSignature}
                  onChange={(e) => setRecipientSignature(e.target.value)}
                  className="w-full text-xs bg-[#fbfbfa] border border-black/10 rounded-xl px-3 py-2 text-[#2d2d22] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="pt-3 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPodModalStop(null)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-[#72725e] hover:bg-black/5 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Verifikasi POD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
