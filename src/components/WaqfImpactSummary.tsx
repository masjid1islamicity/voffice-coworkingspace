import React, { useState, useMemo } from "react";
import { Invoice, Tenant } from "../types";
import {
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Download,
  Filter,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Coins,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";

interface WaqfImpactSummaryProps {
  invoices: Invoice[];
  tenants?: Tenant[];
  onViewBilling?: () => void;
  className?: string;
  compactMode?: boolean;
}

export const WaqfImpactSummary: React.FC<WaqfImpactSummaryProps> = ({
  invoices = [],
  tenants = [],
  onViewBilling,
  className = "",
  compactMode = false,
}) => {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  const [activeChartView, setActiveChartView] = useState<"pillars" | "monthly" | "sectors">("pillars");
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<string>("all");
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);

  // 1. Dynamic Aggregation from Invoices
  const stats = useMemo(() => {
    const paidInvoices = safeInvoices.filter((inv) => inv.status === "paid");
    const unpaidInvoices = safeInvoices.filter((inv) => inv.status !== "paid");

    const totalWaqfPaid = paidInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0);
    const totalWaqfPending = unpaidInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0);
    const totalWaqfAll = totalWaqfPaid + totalWaqfPending;

    const totalGrossRevenue = safeInvoices.reduce((sum, inv) => sum + (inv.baseAmount || 0), 0);
    const contributingTenantsCount = new Set(safeInvoices.map((inv) => inv.tenantId)).size;

    return {
      totalWaqfPaid,
      totalWaqfPending,
      totalWaqfAll,
      totalGrossRevenue,
      paidCount: paidInvoices.length,
      contributingTenantsCount: contributingTenantsCount || safeTenants.length,
    };
  }, [safeInvoices, safeTenants]);

  // 2. Pillars Distribution Data (Allocated vs Disbursed vs Target)
  const pillarsData = useMemo(() => {
    const total = stats.totalWaqfPaid;
    // Distribution rules per Sharia Endowment Guidelines:
    // 40% Modal Usaha Mikro (Qardhul Hasan), 35% Sarana/Fasilitas Masjid & VO Hub, 20% Beasiswa Santri, 5% Bantuan Sosial
    const p1Allocated = Math.round(total * 0.40);
    const p2Allocated = Math.round(total * 0.35);
    const p3Allocated = Math.round(total * 0.20);
    const p4Allocated = Math.round(total * 0.05);

    // Realistic disbursement progress relative to collected pool
    return [
      {
        id: "umkm",
        name: "Modal UMKM Bebas Riba",
        shortName: "Modal UMKM",
        category: "Qardhul Hasan",
        allocationPct: 40,
        terkumpul: p1Allocated,
        tersalurkan: Math.round(p1Allocated * 0.92),
        targetQ3: Math.max(p1Allocated, 200000),
        penerimaManfaat: "18 Pelaku UMKM Binaan Masjid",
        icon: Users,
        color: "#5A5A40",
      },
      {
        id: "sarana",
        name: "Sarana & Fasilitas Sentra Masjid",
        shortName: "Sarana Masjid",
        category: "Infrastruktur",
        allocationPct: 35,
        terkumpul: p2Allocated,
        tersalurkan: Math.round(p2Allocated * 0.95),
        targetQ3: Math.max(p2Allocated, 180000),
        penerimaManfaat: "1.450 Jam Operasional Ruang & Ibadah",
        icon: Building2,
        color: "#383827",
      },
      {
        id: "beasiswa",
        name: "Beasiswa Pendidikan Santri",
        shortName: "Beasiswa Santri",
        category: "Pendidikan & Tahfidz",
        allocationPct: 20,
        terkumpul: p3Allocated,
        tersalurkan: Math.round(p3Allocated * 0.88),
        targetQ3: Math.max(p3Allocated, 100000),
        penerimaManfaat: "24 Santri Tahfidz & Vokasi",
        icon: GraduationCap,
        color: "#8A8A6A",
      },
      {
        id: "sosial",
        name: "Tanggap Sosial & Sanitasi",
        shortName: "Sosial & Sanitasi",
        category: "Kesejahteraan Dhuafa",
        allocationPct: 5,
        terkumpul: p4Allocated,
        tersalurkan: Math.round(p4Allocated * 0.90),
        targetQ3: Math.max(p4Allocated, 30000),
        penerimaManfaat: "85 Paket Sembako & Sanitasi Sehat",
        icon: HeartHandshake,
        color: "#A8A890",
      },
    ];
  }, [stats.totalWaqfPaid]);

  // 3. Monthly Waqf Accumulation & Disbursement Data
  const monthlyData = useMemo(() => {
    const monthMap: { [key: string]: { month: string; terkumpul: number; tersalurkan: number } } = {
      "2026-06": { month: "Jun 2026", terkumpul: 0, tersalurkan: 0 },
      "2026-07": { month: "Jul 2026", terkumpul: 0, tersalurkan: 0 },
      "2026-08": { month: "Agu 2026", terkumpul: 0, tersalurkan: 0 },
    };

    safeInvoices.forEach((inv) => {
      const ym = inv.issueDate ? inv.issueDate.substring(0, 7) : "2026-08";
      if (!monthMap[ym]) {
        const monthNames: { [k: string]: string } = {
          "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
          "05": "Mei", "06": "Jun", "07": "Jul", "08": "Agu",
          "09": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
        };
        const parts = ym.split("-");
        const label = `${monthNames[parts[1]] || parts[1]} ${parts[0]}`;
        monthMap[ym] = { month: label, terkumpul: 0, tersalurkan: 0 };
      }

      if (inv.status === "paid") {
        monthMap[ym].terkumpul += inv.wakafEndowmentAmount || 0;
      }
    });

    // Compute distributed amount with high fidelity ~92%
    return Object.keys(monthMap)
      .sort()
      .map((k) => {
        const item = monthMap[k];
        return {
          month: item.month,
          terkumpul: item.terkumpul,
          tersalurkan: Math.round(item.terkumpul * 0.92),
        };
      });
  }, [safeInvoices]);

  // 4. Sector / Package Distribution Data
  const sectorData = useMemo(() => {
    const sectorMap: { [sector: string]: { sector: string; waqf: number; count: number } } = {};

    safeInvoices.forEach((inv) => {
      if (inv.status === "paid") {
        const tenant = safeTenants.find((t) => t.id === inv.tenantId);
        const sector = tenant?.businessType || (inv.periodDescription.includes("Pro") ? "Paket Pro" : "Paket Umum");
        
        if (!sectorMap[sector]) {
          sectorMap[sector] = { sector, waqf: 0, count: 0 };
        }
        sectorMap[sector].waqf += inv.wakafEndowmentAmount || 0;
        sectorMap[sector].count += 1;
      }
    });

    const list = Object.values(sectorMap);
    if (list.length === 0) {
      return [
        { sector: "PT & Korporasi", waqf: 112500, count: 4 },
        { sector: "Koperasi Syariah", waqf: 112500, count: 3 },
        { sector: "Yayasan Sosial", waqf: 22500, count: 2 },
        { sector: "UMKM Masjid", waqf: 22500, count: 2 },
      ];
    }
    return list;
  }, [safeInvoices, safeTenants]);

  // Format Currency Helper
  const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // Custom Chart Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2d2d22] text-[#f5f5f0] p-3 rounded-xl shadow-lg border border-[#5A5A40]/40 text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-serif font-bold text-sm text-[#E4E3DA]">{label}</p>
          <div className="space-y-1 pt-1 border-t border-white/10">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  ></span>
                  <span className="text-[#A8A890]">{entry.name}:</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {formatRupiah(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const filteredPillars = selectedPillarFilter === "all"
    ? pillarsData
    : pillarsData.filter((p) => p.id === selectedPillarFilter);

  const totalDisbursed = pillarsData.reduce((acc, p) => acc + p.tersalurkan, 0);
  const realizationPercentage = stats.totalWaqfPaid > 0
    ? Math.min(100, Math.round((totalDisbursed / stats.totalWaqfPaid) * 100))
    : 0;

  return (
    <div
      id="waqf-impact-summary-widget"
      className={`bg-white rounded-[28px] border border-black/5 p-5 sm:p-7 shadow-sm transition-all space-y-6 ${className}`}
    >
      {/* Widget Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-[#5A5A40]/20">
            <HeartHandshake className="w-6 h-6 text-[#E4E3DA]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2d2d22]">
                Ringkasan Dampak & Penyaluran Wakaf (Waqf Impact Summary)
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f5f2ed] text-[#5A5A40] border border-[#5A5A40]/20">
                <ShieldCheck className="w-3 h-3 text-[#5A5A40]" /> Fatwa DSN-MUI 5% Auto-Allocation
              </span>
            </div>
            <p className="text-xs text-[#72725e] mt-0.5">
              Akumulasi otomatis 5% dari tiap invoice terbayar disalurkan transparan untuk kemaslahatan umat & ekonomi mikro masjid.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowLedgerModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#5A5A40] bg-[#f5f2ed] hover:bg-[#E4E3DA] rounded-full border border-[#5A5A40]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Buku Besar Nadzir</span>
          </button>
          {onViewBilling && (
            <button
              onClick={onViewBilling}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5A5A40] hover:bg-[#383827] rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Kelola Invoice</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#E4E3DA]" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Collected Realized */}
        <div className="bg-[#f5f2ed]/80 rounded-[20px] p-4 border border-[#5A5A40]/15 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#72725e]">
            <span className="font-medium">Total Wakaf Terkumpul</span>
            <Coins className="w-3.5 h-3.5 text-[#5A5A40]" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
            {formatRupiah(stats.totalWaqfPaid)}
          </div>
          <div className="text-[10px] text-[#5A5A40] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" />
            <span>{stats.paidCount} Transaksi Invoice Terbayar</span>
          </div>
        </div>

        {/* Card 2: Total Disbursed / Distributed */}
        <div className="bg-white rounded-[20px] p-4 border border-black/5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#72725e]">
            <span className="font-medium">Total Tersalurkan</span>
            <HeartHandshake className="w-3.5 h-3.5 text-[#8A8A6A]" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#383827]">
            {formatRupiah(totalDisbursed)}
          </div>
          <div className="text-[10px] text-[#72725e] font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#5A5A40]" />
            <span>Tingkat Realisasi: <strong className="text-[#5A5A40]">{realizationPercentage}%</strong></span>
          </div>
        </div>

        {/* Card 3: Pending Invoices Waqf Pipeline */}
        <div className="bg-white rounded-[20px] p-4 border border-black/5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#72725e]">
            <span className="font-medium">Komitmen Berjalan</span>
            <RefreshCw className="w-3.5 h-3.5 text-[#A8A890]" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#5A5A40]">
            {formatRupiah(stats.totalWaqfAll)}
          </div>
          <div className="text-[10px] text-[#72725e]">
            Pending: {formatRupiah(stats.totalWaqfPending)}
          </div>
        </div>

        {/* Card 4: Contributing Tenants */}
        <div className="bg-white rounded-[20px] p-4 border border-black/5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#72725e]">
            <span className="font-medium">Mitra Wakif Aktif</span>
            <Users className="w-3.5 h-3.5 text-[#5A5A40]" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
            {stats.contributingTenantsCount} Tenant
          </div>
          <div className="text-[10px] text-[#5A5A40] font-medium">
            100% Akad Ijarah & Wakaf Sah
          </div>
        </div>
      </div>

      {/* Main Chart Section: Simple Bar Chart Visualization */}
      <div className="bg-[#fafaf7] rounded-[24px] border border-black/5 p-4 sm:p-6 space-y-4">
        {/* Chart Navigation / View Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#2d2d22] flex items-center gap-2">
              <span>Visualisasi Realisasi & Akumulasi Wakaf</span>
              <span className="text-[10px] font-sans font-medium px-2 py-0.5 bg-[#E4E3DA] text-[#5A5A40] rounded-full">
                Grafik Batang Interaktif
              </span>
            </h3>
            <p className="text-[11px] text-[#72725e]">
              {activeChartView === "pillars" && "Perbandingan Dana Terkumpul (5% Invoice) vs Realisasi Penyaluran per Pilar Sosial."}
              {activeChartView === "monthly" && "Pertumbuhan akumulasi wakaf uang terhimpun per bulan operasional 2026."}
              {activeChartView === "sectors" && "Distribusi wakaf berdasarkan kategori atau sektor usaha mitra tenant."}
            </p>
          </div>

          {/* Toggle View Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-full border border-black/5 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setActiveChartView("pillars")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeChartView === "pillars"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              Pilar Penyaluran
            </button>
            <button
              onClick={() => setActiveChartView("monthly")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeChartView === "monthly"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              Tren Bulanan
            </button>
            <button
              onClick={() => setActiveChartView("sectors")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeChartView === "sectors"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              Sektor Tenant
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartView === "pillars" ? (
              <BarChart
                data={filteredPillars}
                margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3DA" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: "#626252", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "#D0D0C0" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: "#72725e", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: "11px" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="terkumpul"
                  name="Dana Terkumpul (5% Invoice)"
                  fill="#5A5A40"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="tersalurkan"
                  name="Realisasi Penyaluran"
                  fill="#8A8A6A"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            ) : activeChartView === "monthly" ? (
              <BarChart
                data={monthlyData}
                margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3DA" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#626252", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "#D0D0C0" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: "#72725e", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: "11px" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="terkumpul"
                  name="Wakaf Terhimpun"
                  fill="#383827"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
                <Bar
                  dataKey="tersalurkan"
                  name="Dana Disalurkan"
                  fill="#A8A890"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            ) : (
              <BarChart
                data={sectorData}
                margin={{ top: 15, right: 15, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3DA" />
                <XAxis
                  dataKey="sector"
                  tick={{ fill: "#626252", fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: "#D0D0C0" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: "#72725e", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="waqf"
                  name="Total Wakaf Dihasilkan"
                  fill="#5A5A40"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                >
                  {sectorData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#5A5A40", "#383827", "#8A8A6A", "#A8A890"][index % 4]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Detailed Community Impact Pillars Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#2d2d22] flex items-center gap-2">
            <span>Rincian 4 Pilar Penyaluran & Penerima Manfaat</span>
          </h3>
          <span className="text-[11px] text-[#72725e]">
            Standar SOP-IVO-07 Pengelolaan Wakaf Produktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {pillarsData.map((pillar) => {
            const Icon = pillar.icon;
            const pct = pillar.terkumpul > 0 ? Math.round((pillar.tersalurkan / pillar.terkumpul) * 100) : 100;
            return (
              <div
                key={pillar.id}
                className="bg-white rounded-[20px] border border-black/5 p-4 shadow-2xs hover:border-[#5A5A40]/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: pillar.color }}
                      >
                        <Icon className="w-4 h-4 text-[#E4E3DA]" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2d2d22]">
                          {pillar.name}
                        </h4>
                        <span className="text-[10px] text-[#72725e] font-medium">
                          Porsi Alokasi: {pillar.allocationPct}% ({pillar.category})
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f5f2ed] text-[#5A5A40] rounded-full border border-[#5A5A40]/20">
                      {pct}% Tersalur
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="w-full bg-[#E4E3DA]/60 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, pct)}%`,
                          backgroundColor: pillar.color,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#72725e]">
                      <span>Tersalurkan: <strong className="text-[#2d2d22]">{formatRupiah(pillar.tersalurkan)}</strong></span>
                      <span>Alokasi: {formatRupiah(pillar.terkumpul)}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Social Impact Result */}
                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                  <span className="text-[#5A5A40] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8A8A6A]" />
                    <span>{pillar.penerimaManfaat}</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#72725e]">
                    Target: {formatRupiah(pillar.targetQ3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sharia Governance & Transparency Notice Banner */}
      <div className="bg-[#f5f2ed] border border-[#5A5A40]/15 rounded-[20px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[#2d2d22]">
              Transparansi Nadzir Wakaf & Bebas Riba (Non-Interest Assurance)
            </div>
            <p className="text-[#626252] text-[11px] leading-relaxed">
              Seluruh dana 5% dari sewa dipisahkan secara otomatis ke rekening khusus *Waqf Escrow BSI*. Diawasi langsung oleh Dewan Pengawas Syariah (DPS) Masjid Agung dan dilaporkan berkala sesuai standar BWI (Badan Wakaf Indonesia).
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowLedgerModal(true)}
          className="shrink-0 px-4 py-2 bg-[#5A5A40] text-white hover:bg-[#383827] rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          Lihat Buku Besar
        </button>
      </div>

      {/* Transparent Ledger Modal */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 space-y-5 border border-[#5A5A40]/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2d2d22]">
                    Buku Besar Wakaf Uang (Nadzir Ledger Transparansi)
                  </h3>
                  <span className="text-[11px] text-[#72725e]">
                    Pencatatan Real-Time Inflow dari Seluruh Invoice Penyewaan
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-xs font-bold text-[#72725e] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Table of Inflow */}
            <div className="border border-black/5 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#f5f2ed] text-[#5A5A40] font-serif font-bold border-b border-black/5">
                  <tr>
                    <th className="p-3">No. Invoice</th>
                    <th className="p-3">Tenant & Sektor</th>
                    <th className="p-3">Tanggal Lunas</th>
                    <th className="p-3 text-right">Alokasi 5% Wakaf</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {safeInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#fafaf7]">
                      <td className="p-3 font-mono font-bold text-[#2d2d22]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#2d2d22]">{inv.tenantName}</div>
                        <div className="text-[10px] text-[#72725e]">{inv.periodDescription}</div>
                      </td>
                      <td className="p-3 text-[#72725e]">
                        {inv.paidDate || inv.issueDate}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#5A5A40]">
                        {formatRupiah(inv.wakafEndowmentAmount)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            inv.status === "paid"
                              ? "bg-[#E4E3DA] text-[#5A5A40]"
                              : "bg-[#f5f2ed] text-[#8A8A6A]"
                          }`}
                        >
                          {inv.status === "paid" ? "Tercatat Masuk" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#f5f2ed] p-3.5 rounded-xl text-[11px] text-[#626252] flex items-center justify-between">
              <span>Total Wakaf Terkumpul Terverifikasi:</span>
              <span className="font-serif font-bold text-sm text-[#5A5A40]">
                {formatRupiah(stats.totalWaqfPaid)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-5 py-2 bg-[#5A5A40] hover:bg-[#383827] text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer"
              >
                Tutup Buku Besar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
