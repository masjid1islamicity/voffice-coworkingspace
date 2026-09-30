import React, { useState, useMemo } from "react";
import { Invoice, Tenant } from "../types";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  HeartHandshake,
  DollarSign,
  Calendar,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Sparkles,
  Download,
  Info,
  CreditCard,
  Coins,
  ChevronRight,
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
  AreaChart,
  Area,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface RevenueAnalyticsProps {
  invoices: Invoice[];
  tenants: Tenant[];
  className?: string;
  onNavigateTab?: (tab: string) => void;
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  invoices = [],
  tenants = [],
  className = "",
  onNavigateTab,
}) => {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];

  const [activeChartView, setActiveChartView] = useState<
    "stacked_packages" | "revenue_vs_waqf" | "cumulative_trend" | "package_distribution"
  >("stacked_packages");
  const [timeRange, setTimeRange] = useState<"6m" | "ytd" | "all">("ytd");
  const [realizationFilter, setRealizationFilter] = useState<"all" | "paid_only">("all");

  // Helper mapping package name from periodDescription or tenant
  const getPackageTypeFromInvoice = (inv: Invoice): string => {
    const desc = inv.periodDescription || "";
    if (desc.includes("Executive Suite")) return "Paket Executive Suite";
    if (desc.includes("Pro Sharia")) return "Paket Pro Sharia";
    if (desc.includes("Berdaya Basic")) return "Paket Berdaya Basic";
    if (desc.includes("Komunitas Masjid Hub") || desc.includes("Komunitas")) return "Paket Komunitas Masjid Hub";
    
    // Fallback via tenant lookup
    const tenant = safeTenants.find((t) => t.id === inv.tenantId);
    if (tenant) return tenant.packageType;
    return "Paket Pro Sharia";
  };

  // Filter invoices according to selected filters
  const filteredInvoices = useMemo(() => {
    return safeInvoices.filter((inv) => {
      if (realizationFilter === "paid_only" && inv.status !== "paid") return false;
      return true;
    });
  }, [safeInvoices, realizationFilter]);

  // Aggregate monthly data
  const monthlyData = useMemo(() => {
    // Collect all month keys
    const monthsMap: {
      [key: string]: {
        monthKey: string;
        monthLabel: string;
        timestamp: number;
        executive: number;
        pro: number;
        basic: number;
        komunitas: number;
        grossRevenue: number;
        waqfContribution: number;
        netRevenue: number;
        paidInvoicesCount: number;
        totalInvoicesCount: number;
      };
    } = {};

    const monthNamesId: { [key: string]: string } = {
      "01": "Jan",
      "02": "Feb",
      "03": "Mar",
      "04": "Apr",
      "05": "Mei",
      "06": "Jun",
      "07": "Jul",
      "08": "Agu",
      "09": "Sep",
      "10": "Okt",
      "11": "Nov",
      "12": "Des",
    };

    filteredInvoices.forEach((inv) => {
      const dateStr = inv.issueDate || "2026-08-01";
      const [year, month] = dateStr.split("-");
      if (!year || !month) return;

      const monthKey = `${year}-${month}`;
      const monthLabel = `${monthNamesId[month] || month} ${year.slice(2)}`;
      const timestamp = new Date(`${year}-${month}-01`).getTime();

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {
          monthKey,
          monthLabel,
          timestamp,
          executive: 0,
          pro: 0,
          basic: 0,
          komunitas: 0,
          grossRevenue: 0,
          waqfContribution: 0,
          netRevenue: 0,
          paidInvoicesCount: 0,
          totalInvoicesCount: 0,
        };
      }

      const pkg = getPackageTypeFromInvoice(inv);
      const base = inv.baseAmount || 0;
      const waqf = inv.wakafEndowmentAmount || Math.round(base * 0.05);
      const net = base - waqf;

      if (pkg.includes("Executive")) {
        monthsMap[monthKey].executive += base;
      } else if (pkg.includes("Pro")) {
        monthsMap[monthKey].pro += base;
      } else if (pkg.includes("Basic")) {
        monthsMap[monthKey].basic += base;
      } else {
        monthsMap[monthKey].komunitas += base;
      }

      monthsMap[monthKey].grossRevenue += base;
      monthsMap[monthKey].waqfContribution += waqf;
      monthsMap[monthKey].netRevenue += net;
      monthsMap[monthKey].totalInvoicesCount += 1;
      if (inv.status === "paid") {
        monthsMap[monthKey].paidInvoicesCount += 1;
      }
    });

    let sorted = Object.values(monthsMap).sort((a, b) => a.timestamp - b.timestamp);

    // Apply time range filters
    if (timeRange === "6m") {
      sorted = sorted.slice(-6);
    } else if (timeRange === "ytd") {
      sorted = sorted.filter((d) => d.monthKey.startsWith("2026"));
    }

    // Compute cumulative values for the cumulative trend view
    let cumulativeGross = 0;
    let cumulativeWaqf = 0;
    let cumulativeNet = 0;

    return sorted.map((item) => {
      cumulativeGross += item.grossRevenue;
      cumulativeWaqf += item.waqfContribution;
      cumulativeNet += item.netRevenue;

      return {
        ...item,
        cumulativeGross,
        cumulativeWaqf,
        cumulativeNet,
      };
    });
  }, [filteredInvoices, timeRange]);

  // Overall Financial KPIs
  const kpis = useMemo(() => {
    const latestMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const currentMRR = latestMonth ? latestMonth.grossRevenue : 0;
    const previousMRR = previousMonth ? previousMonth.grossRevenue : currentMRR;
    const momGrowth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

    const annualizedRunRate = currentMRR * 12;
    const totalPeriodRevenue = monthlyData.reduce((acc, m) => acc + m.grossRevenue, 0);
    const totalPeriodWaqf = monthlyData.reduce((acc, m) => acc + m.waqfContribution, 0);
    const totalPeriodNet = monthlyData.reduce((acc, m) => acc + m.netRevenue, 0);

    const activeTenantCount = safeTenants.filter((t) => t.status === "active" || t.status === "expiring_soon").length;
    const arpu = activeTenantCount > 0 ? Math.round(currentMRR / activeTenantCount) : 0;

    return {
      currentMRR,
      momGrowth,
      annualizedRunRate,
      totalPeriodRevenue,
      totalPeriodWaqf,
      totalPeriodNet,
      activeTenantCount,
      arpu,
    };
  }, [monthlyData, safeTenants]);

  // Package Distribution Share Data
  const packageShareData = useMemo(() => {
    let executiveTotal = 0;
    let proTotal = 0;
    let basicTotal = 0;
    let komunitasTotal = 0;

    monthlyData.forEach((m) => {
      executiveTotal += m.executive;
      proTotal += m.pro;
      basicTotal += m.basic;
      komunitasTotal += m.komunitas;
    });

    const total = executiveTotal + proTotal + basicTotal + komunitasTotal || 1;

    return [
      {
        name: "Paket Executive Suite",
        value: executiveTotal,
        percentage: Math.round((executiveTotal / total) * 100),
        color: "#5A5A40",
        rateText: "Rp 750.000 / bln",
        desc: "Dedicated desk, private locker & priority meeting room",
      },
      {
        name: "Paket Pro Sharia",
        value: proTotal,
        percentage: Math.round((proTotal / total) * 100),
        color: "#8A8A6A",
        rateText: "Rp 450.000 / bln",
        desc: "Legalitas domisili syariah, mail scanning, & kuota meeting",
      },
      {
        name: "Paket Berdaya Basic",
        value: basicTotal,
        percentage: Math.round((basicTotal / total) * 100),
        color: "#B8B89E",
        rateText: "Rp 250.000 / bln",
        desc: "Alamat domisili legal & notifikasi surat WhatsApp",
      },
      {
        name: "Paket Komunitas Masjid Hub",
        value: komunitasTotal,
        percentage: Math.round((komunitasTotal / total) * 100),
        color: "#D4D4C0",
        rateText: "Rp 150.000 / bln",
        desc: "Subsidi afirmatif bagi UMKM Binaan & Yayasan Dakwah",
      },
    ];
  }, [monthlyData]);

  // Custom Formatter for Indonesian Rupiah in Tooltips
  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2d2d22] text-white p-3.5 rounded-2xl shadow-xl border border-white/10 text-xs space-y-2 min-w-[200px]">
          <div className="font-serif font-bold text-sm text-[#E4E3DA] border-b border-white/10 pb-1.5 flex items-center justify-between">
            <span>Periode: {label}</span>
            <span className="text-[10px] font-mono text-[#C0C0A8]">SOP-IVO-05</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color || entry.fill || "#5A5A40" }}
                  />
                  <span className="text-[11px] text-[#E0E0D0]">{entry.name}:</span>
                </div>
                <span className="font-mono font-bold text-xs text-white">
                  {formatRupiah(entry.value)}
                </span>
              </div>
            ))}
          </div>

          {payload[0]?.payload?.waqfContribution !== undefined && (
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#D8D8C0]">
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3 h-3 text-[#E4E3DA]" />
                Wakaf Produktif (5%):
              </span>
              <span className="font-mono font-bold text-[#E4E3DA]">
                {formatRupiah(payload[0].payload.waqfContribution)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-[24px] border border-black/5 p-6 sm:p-7 shadow-xs space-y-6 ${className}`}>
      {/* Widget Header & Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-black/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#f5f2ed] text-[#5A5A40] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono border border-[#5A5A40]/15">
              SOP-IVO-05 & SOP-IVO-07
            </span>
            <span className="text-xs text-[#72725e] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              Akuntansi Syariah & Pendapatan Terpadu
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#5A5A40]" />
            <span>Revenue Analytics & Tren Langganan</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#72725e] max-w-2xl leading-relaxed">
            Visualisasi performa pendapatan operasional virtual office, breakdown paket langganan bulanan, dan alokasi otomatis 5% wakaf produktif santri & UMKM.
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Pills */}
          <div className="flex items-center gap-1 bg-[#f5f5f0] p-1 rounded-full border border-black/5">
            <button
              onClick={() => setTimeRange("6m")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                timeRange === "6m"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              6 Bulan
            </button>
            <button
              onClick={() => setTimeRange("ytd")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                timeRange === "ytd"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              YTD 2026
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                timeRange === "all"
                  ? "bg-[#5A5A40] text-white shadow-xs"
                  : "text-[#72725e] hover:text-[#2d2d22]"
              }`}
            >
              Semua
            </button>
          </div>

          {/* Realization Filter */}
          <select
            value={realizationFilter}
            onChange={(e) => setRealizationFilter(e.target.value as any)}
            className="text-xs font-semibold text-[#2d2d22] bg-[#f5f5f0] border border-[#5A5A40]/20 rounded-full px-3 py-1.5 focus:ring-1 focus:ring-[#5A5A40] cursor-pointer"
          >
            <option value="all">Semua Tagihan (Gross Billed)</option>
            <option value="paid_only">Hanya Terbayar (Realized Cash)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* MRR Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#72725e]">
            <span className="font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#5A5A40]" />
              MRR (Pendapatan Bulanan)
            </span>
            {kpis.momGrowth >= 0 ? (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40] flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{kpis.momGrowth.toFixed(1)}% MoM
              </span>
            ) : (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#f5f2ed] text-[#8A8A6A]">
                {kpis.momGrowth.toFixed(1)}% MoM
              </span>
            )}
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
            {formatRupiah(kpis.currentMRR)}
          </div>
          <div className="text-[10px] text-[#72725e]">
            ARR Run-Rate: <strong>{formatRupiah(kpis.annualizedRunRate)}</strong> / tahun
          </div>
        </div>

        {/* Period Gross Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#72725e]">
            <span className="font-medium flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-[#5A5A40]" />
              Akumulasi Pendapatan Periode
            </span>
            <span className="text-[10px] font-mono text-[#72725e] bg-[#f5f5f0] px-2 py-0.5 rounded-full">
              {monthlyData.length} Bulan
            </span>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
            {formatRupiah(kpis.totalPeriodRevenue)}
          </div>
          <div className="text-[10px] text-[#72725e]">
            Bersih Sentra (95%): <strong>{formatRupiah(kpis.totalPeriodNet)}</strong>
          </div>
        </div>

        {/* Waqf Contribution Generated */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f5f2ed]/60 border border-[#5A5A40]/15 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#5A5A40]">
            <span className="font-bold flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-[#5A5A40]" />
              Total Wakaf Terhimpun (5%)
            </span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40]">
              Fatwa DSN
            </span>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#383827]">
            {formatRupiah(kpis.totalPeriodWaqf)}
          </div>
          <div className="text-[10px] text-[#626252]">
            Penyaluran: UMKM Dhuafa & Pendidikan Santri
          </div>
        </div>

        {/* ARPU & Active Base */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#fafaf7] border border-black/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#72725e]">
            <span className="font-medium flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#5A5A40]" />
              ARPU & Okupansi
            </span>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#E4E3DA] text-[#5A5A40]">
              {kpis.activeTenantCount} Tenant
            </span>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22]">
            {formatRupiah(kpis.arpu)}
          </div>
          <div className="text-[10px] text-[#72725e]">
            Rata-rata omzet bulanan per entitas tenant
          </div>
        </div>
      </div>

      {/* Chart Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-black/5">
        <button
          onClick={() => setActiveChartView("stacked_packages")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeChartView === "stacked_packages"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-[#f5f5f0] text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Breakdown Paket Langganan (Stacked Bar)</span>
        </button>

        <button
          onClick={() => setActiveChartView("revenue_vs_waqf")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeChartView === "revenue_vs_waqf"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-[#f5f5f0] text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Pendapatan Bersih vs Alokasi Wakaf (Dual Impact)</span>
        </button>

        <button
          onClick={() => setActiveChartView("cumulative_trend")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeChartView === "cumulative_trend"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-[#f5f5f0] text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Tren Akumulasi YTD (Area)</span>
        </button>

        <button
          onClick={() => setActiveChartView("package_distribution")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeChartView === "package_distribution"
              ? "bg-[#5A5A40] text-white shadow-xs"
              : "bg-[#f5f5f0] text-[#72725e] hover:text-[#2d2d22]"
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          <span>Komposisi Paket (Donut Share)</span>
        </button>
      </div>

      {/* Main Chart Area */}
      <div className="bg-[#fafaf7] rounded-2xl border border-black/5 p-4 sm:p-5">
        {/* View 1: Stacked Bar Chart */}
        {activeChartView === "stacked_packages" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                  Tren Pendapatan Bulanan Berdasarkan Kategori Paket Virtual Office
                </h4>
                <p className="text-[11px] text-[#72725e]">
                  Menampilkan proporsi kontribusi paket Executive Suite, Pro Sharia, Berdaya Basic, dan Komunitas Masjid Hub.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#72725e]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]" /> Executive
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8A8A6A]" /> Pro Sharia
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8B89E]" /> Basic
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4D4C0]" /> Komunitas
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5DC" />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: "#72725e", fontSize: 11, fontFamily: "sans-serif" }}
                    axisLine={{ stroke: "#E5E5DC" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#72725e", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#E5E5DC" }}
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString("id-ID")}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="executive" name="Paket Executive Suite" stackId="pkg" fill="#5A5A40" />
                  <Bar dataKey="pro" name="Paket Pro Sharia" stackId="pkg" fill="#8A8A6A" />
                  <Bar dataKey="basic" name="Paket Berdaya Basic" stackId="pkg" fill="#B8B89E" />
                  <Bar dataKey="komunitas" name="Paket Komunitas Masjid Hub" stackId="pkg" fill="#D4D4C0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* View 2: Revenue vs Waqf Composed Chart */}
        {activeChartView === "revenue_vs_waqf" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                  Perbandingan Pendapatan Bersih Operasional vs Alokasi Wakaf (5%)
                </h4>
                <p className="text-[11px] text-[#72725e]">
                  Diagram ganda menampilkan cash flow operasional mandiri sentra serta dana abadi wakaf produktif yang tercipta.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#72725e]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]" /> Pendapatan Bersih (95%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C8A060]" /> Wakaf 5% (Line)
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5DC" />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: "#72725e", fontSize: 11 }}
                    axisLine={{ stroke: "#E5E5DC" }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: "#72725e", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#E5E5DC" }}
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString("id-ID")}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "#A87830", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#E5E5DC" }}
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString("id-ID")}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    yAxisId="left"
                    dataKey="netRevenue"
                    name="Pendapatan Bersih Sentra"
                    fill="#5A5A40"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="waqfContribution"
                    name="Alokasi Wakaf 5%"
                    stroke="#C8A060"
                    strokeWidth={3}
                    dot={{ fill: "#C8A060", r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* View 3: Cumulative Trend Area Chart */}
        {activeChartView === "cumulative_trend" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                  Pertumbuhan Kumulatif Pendapatan & Saldo Dana Wakaf YTD
                </h4>
                <p className="text-[11px] text-[#72725e]">
                  Akumulasi pertumbuhan omzet virtual office dan total dana abadi yang berhasil dihimpun sepanjang tahun berjalan.
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5A5A40" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorWaqf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8A060" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#C8A060" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5DC" />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: "#72725e", fontSize: 11 }}
                    axisLine={{ stroke: "#E5E5DC" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#72725e", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#E5E5DC" }}
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulativeGross"
                    name="Kumulatif Omzet Kotor"
                    stroke="#5A5A40"
                    fillOpacity={1}
                    fill="url(#colorGross)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeWaqf"
                    name="Kumulatif Wakaf 5%"
                    stroke="#C8A060"
                    fillOpacity={1}
                    fill="url(#colorWaqf)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* View 4: Donut / Distribution Share */}
        {activeChartView === "package_distribution" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packageShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {packageShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), "Kontribusi Total"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
                Pangsa Pendapatan Berdasarkan Paket
              </h4>
              <div className="space-y-2">
                {packageShareData.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-black/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: pkg.color }}
                      />
                      <div>
                        <div className="font-semibold text-[#2d2d22]">{pkg.name}</div>
                        <div className="text-[10px] text-[#72725e]">{pkg.desc}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-xs text-[#2d2d22]">
                        {pkg.percentage}%
                      </div>
                      <div className="text-[10px] font-mono text-[#5A5A40]">
                        {formatRupiah(pkg.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Financial Breakdown Ledger Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-serif font-bold text-sm text-[#2d2d22]">
              Tabel Rincian Rekonsiliasi Pendapatan & Wakaf Bulanan
            </h4>
            <p className="text-[11px] text-[#72725e]">
              Rekapitulasi berkas audit keuangan berdasarkan standar pelaporan muamalah Islamicity Sentra.
            </p>
          </div>

          <div className="text-[11px] font-semibold text-[#5A5A40] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terverifikasi Otomatis 100% Sesuai Tagihan</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f5f0] text-[#72725e] font-semibold border-b border-black/5">
              <tr>
                <th className="p-3 pl-4">Periode Bulan</th>
                <th className="p-3 text-right">Executive Suite</th>
                <th className="p-3 text-right">Pro Sharia</th>
                <th className="p-3 text-right">Berdaya Basic</th>
                <th className="p-3 text-right">Komunitas Hub</th>
                <th className="p-3 text-right font-bold text-[#2d2d22]">Total Omzet</th>
                <th className="p-3 text-right text-[#5A5A40] font-bold">Wakaf 5%</th>
                <th className="p-3 text-right text-[#2d2d22] font-bold pr-4">Net Sentra (95%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 bg-white">
              {monthlyData.map((m) => (
                <tr key={m.monthKey} className="hover:bg-[#fafaf7] transition-colors">
                  <td className="p-3 pl-4 font-semibold text-[#2d2d22] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>{m.monthLabel}</span>
                  </td>
                  <td className="p-3 text-right font-mono text-[#72725e]">
                    {formatRupiah(m.executive)}
                  </td>
                  <td className="p-3 text-right font-mono text-[#72725e]">
                    {formatRupiah(m.pro)}
                  </td>
                  <td className="p-3 text-right font-mono text-[#72725e]">
                    {formatRupiah(m.basic)}
                  </td>
                  <td className="p-3 text-right font-mono text-[#72725e]">
                    {formatRupiah(m.komunitas)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[#2d2d22]">
                    {formatRupiah(m.grossRevenue)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[#5A5A40] bg-[#f5f2ed]/40">
                    {formatRupiah(m.waqfContribution)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[#383827] pr-4">
                    {formatRupiah(m.netRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#f5f2ed] font-bold border-t border-[#5A5A40]/15">
              <tr>
                <td className="p-3 pl-4 text-[#383827]">Total Akumulasi</td>
                <td className="p-3 text-right font-mono text-[#5A5A40]">
                  {formatRupiah(monthlyData.reduce((acc, m) => acc + m.executive, 0))}
                </td>
                <td className="p-3 text-right font-mono text-[#5A5A40]">
                  {formatRupiah(monthlyData.reduce((acc, m) => acc + m.pro, 0))}
                </td>
                <td className="p-3 text-right font-mono text-[#5A5A40]">
                  {formatRupiah(monthlyData.reduce((acc, m) => acc + m.basic, 0))}
                </td>
                <td className="p-3 text-right font-mono text-[#5A5A40]">
                  {formatRupiah(monthlyData.reduce((acc, m) => acc + m.komunitas, 0))}
                </td>
                <td className="p-3 text-right font-mono text-sm text-[#2d2d22]">
                  {formatRupiah(kpis.totalPeriodRevenue)}
                </td>
                <td className="p-3 text-right font-mono text-sm text-[#5A5A40] bg-[#E4E3DA]">
                  {formatRupiah(kpis.totalPeriodWaqf)}
                </td>
                <td className="p-3 text-right font-mono text-sm text-[#2d2d22] pr-4">
                  {formatRupiah(kpis.totalPeriodNet)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
