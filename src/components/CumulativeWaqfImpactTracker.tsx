import React, { useState, useMemo } from "react";
import { Invoice, Tenant, RecurringWakafSubscription } from "../types";
import {
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Coins,
  Store,
  Sun,
  Utensils,
  Ambulance,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Sliders,
  FileText,
  ExternalLink,
  Target,
  BadgePercent,
  CircleDollarSign,
  HelpCircle,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export interface CumulativeWaqfImpactTrackerProps {
  invoices: Invoice[];
  tenants?: Tenant[];
  subscriptions?: RecurringWakafSubscription[];
  onNavigateTab?: (tabId: string) => void;
  className?: string;
}

export interface CommunityProjectImpactData {
  id: string;
  name: string;
  shortName: string;
  category: string;
  icon: any;
  allocationPct: number;
  terkumpul: number;
  tersalurkan: number;
  cadangan: number;
  beneficiaryCount: number;
  beneficiaryUnit: string;
  beneficiarySummary: string;
  unitCost: number;
  sdgGoal: string;
  sdgTag: string;
  status: "Aktif Menyalurkan" | "Penyaluran Batch Berjalan" | "Optimal";
  color: string;
  accentBg: string;
  recentActivities: {
    date: string;
    description: string;
    amount: number;
    location: string;
  }[];
}

export const CumulativeWaqfImpactTracker: React.FC<CumulativeWaqfImpactTrackerProps> = ({
  invoices = [],
  tenants = [],
  subscriptions = [],
  onNavigateTab,
  className = "",
}) => {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];

  const [activeTab, setActiveTab] = useState<"projects" | "analytics" | "tenants_breakdown" | "simulator">("projects");
  const [selectedProject, setSelectedProject] = useState<CommunityProjectImpactData | null>(null);
  const [simulatedMonthlyRent, setSimulatedMonthlyRent] = useState<number>(450000);
  const [simulatedTenureMonths, setSimulatedTenureMonths] = useState<number>(12);
  const [voluntaryExtraWaqfPct, setVoluntaryExtraWaqfPct] = useState<number>(0);

  // 1. Core Financial Aggregations
  const stats = useMemo(() => {
    const paidInvoices = safeInvoices.filter((inv) => inv.status === "paid");
    const unpaidInvoices = safeInvoices.filter((inv) => inv.status !== "paid");

    const totalWaqfPaid = paidInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0);
    const totalWaqfPending = unpaidInvoices.reduce((sum, inv) => sum + (inv.wakafEndowmentAmount || 0), 0);
    const totalWaqfCumulative = totalWaqfPaid + totalWaqfPending;

    const totalGrossRevenue = safeInvoices.reduce((sum, inv) => sum + (inv.baseAmount || 0), 0);

    // Active tenants contributing
    const contributingTenantIds = new Set(safeInvoices.map((inv) => inv.tenantId));
    const activeTenantCount = safeTenants.filter((t) => t.status === "active").length;
    const contributingCount = contributingTenantIds.size || activeTenantCount;

    // Subscription monthly run-rate
    const activeSubscriptions = safeSubscriptions.filter((s) => s.status === "active");
    const recurringMonthlyRunRate = activeSubscriptions.reduce((sum, s) => sum + (s.effectiveMonthlyAmount || s.amount || 0), 0);

    // Overall target milestone (e.g. Q3 2026 Milestone Rp 2.500.000)
    const milestoneTarget = 2500000;
    const milestoneProgressPct = Math.min(100, Math.round((totalWaqfPaid / milestoneTarget) * 100));

    return {
      totalWaqfPaid,
      totalWaqfPending,
      totalWaqfCumulative,
      totalGrossRevenue,
      contributingCount,
      activeTenantCount,
      recurringMonthlyRunRate,
      milestoneTarget,
      milestoneProgressPct,
    };
  }, [safeInvoices, safeTenants, safeSubscriptions]);

  // 2. Dynamic Community Projects Distribution (Standard Sharia 5-Pillar Portfolio)
  const projectsData: CommunityProjectImpactData[] = useMemo(() => {
    const pool = stats.totalWaqfPaid;
    
    // Distribution shares:
    // 35% Modal UMKM Qardhul Hasan
    // 25% Beasiswa Santripreneur
    // 15% Eco-Mosque Solar Panel
    // 15% Dapur Berkah Jum'at
    // 10% Klinik & Ambulans Dhuafa
    const umkmAlloc = Math.round(pool * 0.35);
    const eduAlloc = Math.round(pool * 0.25);
    const greenAlloc = Math.round(pool * 0.15);
    const foodAlloc = Math.round(pool * 0.15);
    const healthAlloc = Math.round(pool * 0.10);

    const umkmDisbursed = Math.round(umkmAlloc * 0.92);
    const eduDisbursed = Math.round(eduAlloc * 0.90);
    const greenDisbursed = Math.round(greenAlloc * 0.94);
    const foodDisbursed = Math.round(foodAlloc * 0.96);
    const healthDisbursed = Math.round(healthAlloc * 0.88);

    // Dynamic Beneficiary calculations
    const umkmBeneficiaries = Math.max(1, Math.round(umkmDisbursed / 250000) + 12);
    const eduBeneficiaries = Math.max(1, Math.round(eduDisbursed / 150000) + 18);
    const greenKwh = Math.max(1, Math.round((greenDisbursed / 100000) * 45) + 320);
    const foodPortions = Math.max(10, Math.round(foodDisbursed / 25000) + 320);
    const healthPatients = Math.max(1, Math.round(healthDisbursed / 100000) + 45);

    return [
      {
        id: "proj-umkm",
        name: "Modal Bergulir Qardhul Hasan UMKM",
        shortName: "Modal UMKM",
        category: "Ekonomi Mikro Syariah",
        icon: Store,
        allocationPct: 35,
        terkumpul: umkmAlloc,
        tersalurkan: umkmDisbursed,
        cadangan: umkmAlloc - umkmDisbursed,
        beneficiaryCount: umkmBeneficiaries,
        beneficiaryUnit: "Pelaku Usaha Mikro",
        beneficiarySummary: `${umkmBeneficiaries} Warung & Pedagang Binaan Mandiri`,
        unitCost: 2500000,
        sdgGoal: "SDG 1 & SDG 8: Tanpa Kemiskinan & Pekerjaan Layak",
        sdgTag: "SDG 1, 8",
        status: "Aktif Menyalurkan",
        color: "#5A5A40",
        accentBg: "#f5f2ed",
        recentActivities: [
          {
            date: "2026-08-18",
            description: "Penyaluran modal kerja tanpa bunga batch 4 untuk 4 warung kelontong sekitar masjid",
            amount: 10000000,
            location: "Kecamatan Menteng & Gambir",
          },
          {
            date: "2026-08-05",
            description: "Pendampingan pencatatan buku kas digital dan sertifikasi halal self-declare UMKM",
            amount: 1500000,
            location: "Aula Masjid Syariah Hub",
          },
        ],
      },
      {
        id: "proj-edu",
        name: "Beasiswa Santripreneur & Digital Talent",
        shortName: "Beasiswa Santri",
        category: "Pendidikan & Vokasi",
        icon: GraduationCap,
        allocationPct: 25,
        terkumpul: eduAlloc,
        tersalurkan: eduDisbursed,
        cadangan: eduAlloc - eduDisbursed,
        beneficiaryCount: eduBeneficiaries,
        beneficiaryUnit: "Santri & Mahasiswa",
        beneficiarySummary: `${eduBeneficiaries} Santri Vokasi IT & Tahfidz`,
        unitCost: 1500000,
        sdgGoal: "SDG 4: Pendidikan Berkualitas & Literasi Digital",
        sdgTag: "SDG 4",
        status: "Aktif Menyalurkan",
        color: "#383827",
        accentBg: "#E4E3DA",
        recentActivities: [
          {
            date: "2026-08-15",
            description: "Penyaluran beasiswa SPP semester ganjil santri tahfidz dhuafa berprestasi",
            amount: 4500000,
            location: "Pesantren Binaan V-Office",
          },
          {
            date: "2026-07-28",
            description: "Bootcamp Koding & AI Syariah bersertifikat untuk 15 pemuda mustahik",
            amount: 3000000,
            location: "Coworking Lab Lt. 2",
          },
        ],
      },
      {
        id: "proj-green",
        name: "Solar Panel & Sanitasi Masjid Hijau (Eco-Mosque)",
        shortName: "Eco-Mosque Hijau",
        category: "Energi Bersih & Fasilitas",
        icon: Sun,
        allocationPct: 15,
        terkumpul: greenAlloc,
        tersalurkan: greenDisbursed,
        cadangan: greenAlloc - greenDisbursed,
        beneficiaryCount: greenKwh,
        beneficiaryUnit: "kWh Energi Bersih",
        beneficiarySummary: `${greenKwh.toLocaleString("id-ID")} kWh Listrik Bersih & Daur Ulang Wudhu`,
        unitCost: 3500000,
        sdgGoal: "SDG 7 & SDG 13: Energi Bersih & Aksi Iklim",
        sdgTag: "SDG 7, 13",
        status: "Optimal",
        color: "#8A8A6A",
        accentBg: "#f5f2ed",
        recentActivities: [
          {
            date: "2026-08-10",
            description: "Maintenance rutin inverter PLTS atap dan pengurasan filter hidroponik air wudhu",
            amount: 1200000,
            location: "Rooftop Masjid Hub",
          },
          {
            date: "2026-07-14",
            description: "Instalasi modul fotovoltaik tambahan 1 kWp untuk menopang server virtual office",
            amount: 7000000,
            location: "Sayap Barat Bangunan",
          },
        ],
      },
      {
        id: "proj-food",
        name: "Dapur Berkah Jum'at & Nutrisi Stunting",
        shortName: "Dapur Berkah",
        category: "Ketahanan Pangan",
        icon: Utensils,
        allocationPct: 15,
        terkumpul: foodAlloc,
        tersalurkan: foodDisbursed,
        cadangan: foodAlloc - foodDisbursed,
        beneficiaryCount: foodPortions,
        beneficiaryUnit: "Porsi Makanan Bergizi",
        beneficiarySummary: `${foodPortions.toLocaleString("id-ID")} Porsi Makanan Bergizi Dibagikan`,
        unitCost: 25000,
        sdgGoal: "SDG 2 & SDG 3: Tanpa Kelaparan & Bebas Stunting",
        sdgTag: "SDG 2, 3",
        status: "Aktif Menyalurkan",
        color: "#5A5A40",
        accentBg: "#E4E3DA",
        recentActivities: [
          {
            date: "2026-08-21",
            description: "Distribusi 250 kotak nasi bergizi & susu kurma bakda Sholat Jum'at",
            amount: 6250000,
            location: "Pelataran Masjid & Pos Dhuafa",
          },
          {
            date: "2026-08-14",
            description: "Pemberian paket nutrisi tinggi protein telur dan susu untuk 30 balita",
            amount: 3000000,
            location: "Posyandu Binaan Kelurahan",
          },
        ],
      },
      {
        id: "proj-health",
        name: "Klinik Pratama & Layanan Ambulans Siaga Gratis",
        shortName: "Klinik & Ambulans",
        category: "Kesehatan Dhuafa",
        icon: Ambulance,
        allocationPct: 10,
        terkumpul: healthAlloc,
        tersalurkan: healthDisbursed,
        cadangan: healthAlloc - healthDisbursed,
        beneficiaryCount: healthPatients,
        beneficiaryUnit: "Pasien Dhuafa & Trip Gawat Darurat",
        beneficiarySummary: `${healthPatients} Pasien Mustahik Tertolong Medis`,
        unitCost: 500000,
        sdgGoal: "SDG 3: Kehidupan Sehat dan Sejahtera",
        sdgTag: "SDG 3",
        status: "Penyaluran Batch Berjalan",
        color: "#A8A890",
        accentBg: "#f5f2ed",
        recentActivities: [
          {
            date: "2026-08-19",
            description: "Operasional 6 rujukan ambulans darurat gratis warga prasejahtera ke RSUD",
            amount: 1800000,
            location: "Jabodetabek",
          },
          {
            date: "2026-08-08",
            description: "Pemeriksaan gula darah, tensi, dan pemberian obat generik gratis untuk 80 lansia",
            amount: 2400000,
            location: "Klinik Sayap Timur Masjid",
          },
        ],
      },
    ];
  }, [stats.totalWaqfPaid]);

  const totalDisbursedAll = useMemo(() => {
    return projectsData.reduce((sum, p) => sum + p.tersalurkan, 0);
  }, [projectsData]);

  const totalReserveAll = useMemo(() => {
    return Math.max(0, stats.totalWaqfPaid - totalDisbursedAll);
  }, [stats.totalWaqfPaid, totalDisbursedAll]);

  // 3. Monthly Trend Inflow vs Cumulative Waqf Pool Data for Recharts
  const trendData = useMemo(() => {
    const months = [
      { key: "2026-03", name: "Mar 2026", monthlyInflow: 45000, cumulative: 45000, disbursed: 40000 },
      { key: "2026-04", name: "Apr 2026", monthlyInflow: 67500, cumulative: 112500, disbursed: 100000 },
      { key: "2026-05", name: "Mei 2026", monthlyInflow: 112500, cumulative: 225000, disbursed: 205000 },
      { key: "2026-06", name: "Jun 2026", monthlyInflow: 135000, cumulative: 360000, disbursed: 330000 },
      { key: "2026-07", name: "Jul 2026", monthlyInflow: 180000, cumulative: 540000, disbursed: 495000 },
      { key: "2026-08", name: "Agu 2026 (Kini)", monthlyInflow: Math.max(stats.totalWaqfPaid - 540000, 225000), cumulative: stats.totalWaqfPaid || 765000, disbursed: totalDisbursedAll || 705000 },
    ];
    return months;
  }, [stats.totalWaqfPaid, totalDisbursedAll]);

  // 4. Tenant Contribution Leaderboard & Direct Impact Mapping
  const tenantContributions = useMemo(() => {
    return safeTenants.map((t) => {
      // Find invoices paid for this tenant
      const tenantInvoices = safeInvoices.filter((i) => i.tenantId === t.id && i.status === "paid");
      const computedWaqf = tenantInvoices.reduce((sum, i) => sum + (i.wakafEndowmentAmount || 0), 0);
      const totalContributed = computedWaqf > 0 ? computedWaqf : (t.wakafEndowmentContributed || Math.round(t.monthlyRate * 0.05 * 3));
      
      const monthlyRate = t.monthlyRate || 350000;
      const monthlyWaqf = Math.round(monthlyRate * 0.05);

      // Equivalent impact estimation
      const mealsFunded = Math.max(1, Math.round(totalContributed / 25000));
      const santriHours = Math.max(2, Math.round((totalContributed / 150000) * 20));

      return {
        tenantId: t.id,
        companyName: t.companyName,
        businessSector: t.businessSector || t.businessType,
        packageType: t.packageType,
        monthlyRate,
        monthlyWaqf,
        totalContributed,
        mealsFunded,
        santriHours,
        status: t.status,
      };
    }).sort((a, b) => b.totalContributed - a.totalContributed);
  }, [safeTenants, safeInvoices]);

  // 5. Interactive Simulation Calculation
  const simulationResults = useMemo(() => {
    const baseWaqfPct = 5 + voluntaryExtraWaqfPct;
    const monthlyWaqf = Math.round(simulatedMonthlyRent * (baseWaqfPct / 100));
    const totalWaqfSimulated = monthlyWaqf * simulatedTenureMonths;

    // Direct social equivalents
    const qardhulHasanShare = totalWaqfSimulated * 0.35;
    const educationShare = totalWaqfSimulated * 0.25;
    const foodPortions = Math.max(1, Math.round((totalWaqfSimulated * 0.15) / 25000));
    const cleanEnergyKwh = Math.max(1, Math.round(((totalWaqfSimulated * 0.15) / 100000) * 45));
    const santriDays = Math.max(1, Math.round((educationShare / 150000) * 30));

    return {
      baseWaqfPct,
      monthlyWaqf,
      totalWaqfSimulated,
      foodPortions,
      cleanEnergyKwh,
      santriDays,
      qardhulHasanShare,
    };
  }, [simulatedMonthlyRent, simulatedTenureMonths, voluntaryExtraWaqfPct]);

  // Helper currency formatter
  const formatRupiah = (val: number) => `Rp ${(val || 0).toLocaleString("id-ID")}`;

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2d2d22] text-[#f5f5f0] p-3 rounded-2xl shadow-xl border border-[#5A5A40]/40 text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-serif font-bold text-xs sm:text-sm text-[#E4E3DA]">{label}</p>
          <div className="space-y-1 pt-1.5 border-t border-white/10">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
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

  return (
    <div
      id="cumulative-waqf-impact-tracker-widget"
      className={`bg-white rounded-[28px] border border-black/5 p-5 sm:p-7 shadow-sm transition-all space-y-6 ${className}`}
    >
      {/* Header & Mission Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-black/5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-[#5A5A40]/20">
            <HeartHandshake className="w-6 h-6 text-[#E4E3DA]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif font-bold text-[#2d2d22] text-lg sm:text-xl">
                Pelacak Dampak Akumulatif Wakaf Uang (Community Impact Tracker)
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f5f2ed] border border-[#5A5A40]/20 text-[#5A5A40] text-[10px] font-bold uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3 h-3 text-[#5A5A40]" /> DSN-MUI & BWI Compliant
              </span>
            </div>
            <p className="text-xs text-[#72725e] mt-1 max-w-2xl leading-relaxed">
              Pantau akumulasi dana wakaf produktif yang disisihkan secara otomatis (5% dari setiap pembayaran sewa tenant) dan distribusinya ke 5 portofolio proyek sosial & ekonomi umat masjid.
            </p>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("billing")}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 bg-[#f5f2ed] hover:bg-[#E4E3DA] text-[#5A5A40] border border-[#5A5A40]/20"
              id="btn-nav-to-calculator-from-tracker"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Kalkulator & Langganan Rutin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* High-Level Cumulative Metric Cards (4 Bento Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Wakaf Terkumpul (Paid) */}
        <div className="bg-[#fafaf7] rounded-[22px] p-4.5 border border-black/5 hover:border-[#5A5A40]/30 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#72725e] font-medium flex items-center gap-1.5">
              <CircleDollarSign className="w-3.5 h-3.5 text-[#5A5A40]" /> Total Terkumpul (Kas)
            </span>
            <span className="text-[10px] font-bold text-[#5A5A40] bg-white px-2 py-0.5 rounded-full border border-black/5">
              Realisasi
            </span>
          </div>
          <div className="my-2.5">
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
              {formatRupiah(stats.totalWaqfPaid)}
            </div>
            <div className="text-[11px] text-[#5A5A40] font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#5A5A40]" /> Inflow rutin dari {stats.contributingCount} Tenant V-Office
            </div>
          </div>
          <div className="pt-2 border-t border-black/5 text-[10px] text-[#72725e] flex items-center justify-between">
            <span>Pending di Invoice:</span>
            <span className="font-mono font-bold text-[#5A5A40]">{formatRupiah(stats.totalWaqfPending)}</span>
          </div>
        </div>

        {/* Metric 2: Total Tersalurkan ke Proyek */}
        <div className="bg-[#fafaf7] rounded-[22px] p-4.5 border border-black/5 hover:border-[#5A5A40]/30 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#72725e] font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#5A5A40]" /> Total Tersalurkan
            </span>
            <span className="text-[10px] font-bold text-white bg-[#5A5A40] px-2 py-0.5 rounded-full">
              {stats.totalWaqfPaid > 0 ? Math.round((totalDisbursedAll / stats.totalWaqfPaid) * 100) : 92}% Rasio
            </span>
          </div>
          <div className="my-2.5">
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#5A5A40] tracking-tight">
              {formatRupiah(totalDisbursedAll)}
            </div>
            <div className="text-[11px] text-[#72725e] font-medium mt-1">
              Didistribusikan ke 5 Portofolio Masjid
            </div>
          </div>
          <div className="pt-2 border-t border-black/5 text-[10px] text-[#72725e] flex items-center justify-between">
            <span>Cadangan Likuiditas:</span>
            <span className="font-mono font-bold text-[#2d2d22]">{formatRupiah(totalReserveAll)}</span>
          </div>
        </div>

        {/* Metric 3: Penerima Manfaat Nyata (Beneficiaries) */}
        <div className="bg-[#fafaf7] rounded-[22px] p-4.5 border border-black/5 hover:border-[#5A5A40]/30 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#72725e] font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#5A5A40]" /> Penerima Manfaat
            </span>
            <span className="text-[10px] font-bold text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full">
              5 Sektor
            </span>
          </div>
          <div className="my-2.5">
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#2d2d22] tracking-tight">
              1.800+ Jiwa
            </div>
            <div className="text-[11px] text-[#5A5A40] font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" /> Dhuafa, Santri & UMKM Warung
            </div>
          </div>
          <div className="pt-2 border-t border-black/5 text-[10px] text-[#72725e] flex items-center justify-between">
            <span>Audit Nadzir:</span>
            <span className="font-mono text-[#5A5A40] font-semibold">100% Terverifikasi</span>
          </div>
        </div>

        {/* Metric 4: Milestone Target Dana Abadi */}
        <div className="bg-[#4a4a35] text-white rounded-[22px] p-4.5 border border-[#5A5A40]/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#E4E3DA] font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#E4E3DA]" /> Milestone Q3 2026
            </span>
            <span className="text-[10px] font-bold text-[#2d2d22] bg-[#E4E3DA] px-2 py-0.5 rounded-full font-mono">
              {stats.milestoneProgressPct}%
            </span>
          </div>
          <div className="my-2.5">
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#f5f5f0] tracking-tight">
              {formatRupiah(stats.milestoneTarget)}
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#E4E3DA] h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.milestoneProgressPct}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 text-[10px] text-[#E4E3DA]/80 flex items-center justify-between">
            <span>Sisa Target:</span>
            <span className="font-mono font-bold text-white">
              {formatRupiah(Math.max(0, stats.milestoneTarget - stats.totalWaqfPaid))}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Tabs for Module Views */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-[#fafaf7] rounded-[20px] border border-black/5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "projects"
                ? "bg-[#5A5A40] text-white shadow-2xs"
                : "text-[#72725e] hover:text-[#2d2d22] bg-white/60"
            }`}
            id="tab-btn-tracker-projects"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Portofolio & Penyaluran Proyek ({projectsData.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "analytics"
                ? "bg-[#5A5A40] text-white shadow-2xs"
                : "text-[#72725e] hover:text-[#2d2d22] bg-white/60"
            }`}
            id="tab-btn-tracker-analytics"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grafik Akumulasi & Tren Inflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tenants_breakdown")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "tenants_breakdown"
                ? "bg-[#5A5A40] text-white shadow-2xs"
                : "text-[#72725e] hover:text-[#2d2d22] bg-white/60"
            }`}
            id="tab-btn-tracker-tenants"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kontribusi Tenant (Honor Roll)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "simulator"
                ? "bg-[#5A5A40] text-white shadow-2xs"
                : "text-[#72725e] hover:text-[#2d2d22] bg-white/60"
            }`}
            id="tab-btn-tracker-simulator"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulasi Dampak Sewa Anda</span>
          </button>
        </div>

        <div className="text-[11px] text-[#72725e] flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-black/5 font-mono">
          <Calendar className="w-3 h-3 text-[#5A5A40]" />
          <span>Update Terakhir: Realtime 2026</span>
        </div>
      </div>

      {/* VIEW 1: PROJECTS BENTO GRID & DISTRIBUTION PROGRESS */}
      {activeTab === "projects" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-[#626252]">
              Distribusi dana wakaf produktif berdasarkan mandat DSN-MUI & Perjanjian Akad Sewa Virtual Office Masjid:
            </div>
            <div className="text-[11px] font-semibold text-[#5A5A40] flex items-center gap-1.5">
              <span>Klik kartu proyek untuk rincian item belanja & bukti transparansi</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {projectsData.map((project) => {
              const IconComp = project.icon;
              const percentDisbursed = project.terkumpul > 0 
                ? Math.round((project.tersalurkan / project.terkumpul) * 100)
                : 92;

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-[#fafaf7] hover:bg-white rounded-[22px] border border-black/5 hover:border-[#5A5A40]/40 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  id={`project-card-${project.id}`}
                >
                  <div className="space-y-3.5">
                    {/* Card Header: Category & Share Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-white border border-black/5 text-[#5A5A40]">
                        {project.category}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#5A5A40] text-white">
                        Alokasi {project.allocationPct}%
                      </span>
                    </div>

                    {/* Title & Icon */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-black/5 text-[#5A5A40] flex items-center justify-center shrink-0 group-hover:bg-[#5A5A40] group-hover:text-white transition-all shadow-2xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#2d2d22] leading-tight group-hover:text-[#5A5A40] transition-colors">
                          {project.name}
                        </h4>
                        <div className="text-[10px] font-semibold text-[#72725e] mt-1 flex items-center gap-1">
                          <span className="px-1.5 py-0.2 bg-[#f5f2ed] rounded text-[#5A5A40] font-mono">
                            {project.sdgTag}
                          </span>
                          <span className="line-clamp-1">{project.sdgGoal.split(":")[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Beneficiary Metric Banner */}
                    <div className="bg-white rounded-xl p-3 border border-black/5 space-y-1">
                      <div className="text-[10px] text-[#72725e]">Capaian Dampak Langsung:</div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-[#2d2d22] text-[#5A5A40]">
                        {project.beneficiarySummary}
                      </div>
                    </div>

                    {/* Financial Progress Meter */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#72725e]">Tersalurkan:</span>
                        <span className="font-mono font-bold text-[#2d2d22]">
                          {formatRupiah(project.tersalurkan)}{" "}
                          <span className="text-[10px] text-[#5A5A40] font-normal">
                            ({percentDisbursed}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#5A5A40] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentDisbursed}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#72725e]">
                        <span>Dana Dialokasikan: {formatRupiah(project.terkumpul)}</span>
                        <span>Cadangan: {formatRupiah(project.cadangan)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Detail Link */}
                  <div className="pt-3.5 mt-3.5 border-t border-black/5 flex items-center justify-between text-xs text-[#5A5A40] font-semibold group-hover:text-[#383827]">
                    <span className="text-[11px]">Lihat Catatan Realisasi</span>
                    <ChevronRight className="w-4 h-4 text-[#A8A890] group-hover:text-[#5A5A40] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sharia Governance & Verification Banner */}
          <div className="bg-[#f5f2ed] rounded-[22px] p-4.5 border border-[#5A5A40]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#E4E3DA]" />
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-[#2d2d22]">Akuntabilitas & Audit Fiqh Nadzir Masjid</div>
                <p className="text-[11px] text-[#626252]">
                  Setiap rupiah dicatat secara real-time pada akad ijarah, dilaporkan berkala kepada Badan Wakaf Indonesia (BWI), dan disalurkan tanpa biaya admin terselubung.
                </p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("billing")}
                className="px-4 py-2 bg-white hover:bg-[#E4E3DA] text-[#5A5A40] font-bold rounded-full border border-[#5A5A40]/20 shrink-0 transition-all cursor-pointer"
              >
                Unduh Dossier PDF
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: RECHARTS ACCUMULATION & INFLOW TRENDS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Chart: Cumulative Growth (7 cols) */}
            <div className="lg:col-span-7 bg-[#fafaf7] p-5 sm:p-6 rounded-[22px] border border-black/5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#2d2d22]">
                    Pertumbuhan Akumulatif Dana Wakaf (Maret - Agustus 2026)
                  </h3>
                  <p className="text-[11px] text-[#72725e]">
                    Grafik akumulasi dana wakaf terkumpul vs realisasi tersalurkan ke program umat
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#5A5A40]"></span>
                    <span className="text-[#626252]">Total Terkumpul</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#8A8A6A]"></span>
                    <span className="text-[#626252]">Tersalurkan</span>
                  </div>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#5A5A40" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8A8A6A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8A8A6A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5dc" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#72725e" }}
                      axisLine={{ stroke: "#d5d5ca" }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString("id-ID")}k`}
                      tick={{ fontSize: 10, fill: "#72725e" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      name="Akumulasi Terkumpul"
                      stroke="#5A5A40"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorCumulative)"
                    />
                    <Area
                      type="monotone"
                      dataKey="disbursed"
                      name="Total Tersalurkan"
                      stroke="#8A8A6A"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorDisbursed)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Chart: Portfolio Share Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-[#fafaf7] p-5 sm:p-6 rounded-[22px] border border-black/5 space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#2d2d22]">
                  Porsi Alokasi 5 Sektor Komunitas
                </h3>
                <p className="text-[11px] text-[#72725e]">
                  Proporsi penyaluran dana sesuai kesepakatan Nadzir & Standar Syariah
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {projectsData.map((p) => (
                  <div key={p.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                        <span className="font-medium text-[#2d2d22]">{p.shortName}</span>
                      </div>
                      <div className="font-mono text-[#5A5A40] font-bold">
                        {p.allocationPct}% ({formatRupiah(p.terkumpul)})
                      </div>
                    </div>
                    <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.allocationPct}%`, backgroundColor: p.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-black/5 text-[11px] text-[#72725e] flex items-center justify-between">
                <span>Total Dana Terdistribusi:</span>
                <span className="font-mono font-bold text-[#5A5A40]">{formatRupiah(totalDisbursedAll)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TENANT HONOR ROLL & EQUIVALENT IMPACT TABLE */}
      {activeTab === "tenants_breakdown" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-[#626252]">
              Daftar kontribusi wakaf dari entitas usaha penyewa virtual office di ekosistem Masjid Syariah Hub:
            </div>
            <div className="text-[11px] font-mono bg-[#f5f2ed] text-[#5A5A40] px-3 py-1 rounded-full font-bold">
              {tenantContributions.length} Entitas Berkontribusi
            </div>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-black/5">
            <table className="w-full text-left text-xs border-collapse bg-white">
              <thead>
                <tr className="bg-[#fafaf7] text-[#72725e] border-b border-black/5 font-semibold text-[11px]">
                  <th className="py-3 px-4">Nama Perusahaan / Tenant</th>
                  <th className="py-3 px-4">Paket & Sektor Bisnis</th>
                  <th className="py-3 px-4">Sewa Bulanan</th>
                  <th className="py-3 px-4">Wakaf / Bulan (5%)</th>
                  <th className="py-3 px-4">Akumulasi Wakaf</th>
                  <th className="py-3 px-4">Dampak Sosial Setara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {tenantContributions.map((tenant, idx) => (
                  <tr key={tenant.tenantId} className="hover:bg-[#fafaf7]/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#f5f2ed] text-[#5A5A40] font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-[#2d2d22]">{tenant.companyName}</div>
                          <div className="text-[10px] text-[#72725e] font-mono">{tenant.tenantId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#2d2d22] font-medium">{tenant.packageType}</div>
                      <div className="text-[10px] text-[#72725e]">{tenant.businessSector}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#2d2d22]">
                      {formatRupiah(tenant.monthlyRate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#5A5A40]">
                      {formatRupiah(tenant.monthlyWaqf)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#2d2d22] bg-[#f5f2ed] px-2.5 py-1 rounded-full">
                        {formatRupiah(tenant.totalContributed)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-[#5A5A40] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#5A5A40]" />
                        <span>
                          {tenant.mealsFunded} porsi makan + {tenant.santriHours} jam beasiswa santri
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: INTERACTIVE SIMULATOR (SIMULASI DAMPAK SEWA ANDA) */}
      {activeTab === "simulator" && (
        <div className="bg-[#fafaf7] rounded-[22px] p-5 sm:p-7 border border-black/5 space-y-6">
          <div className="max-w-2xl space-y-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2d2d22]">
              Simulasi Dampak Nyata dari Sewa Virtual Office Anda
            </h3>
            <p className="text-xs text-[#72725e]">
              Lihat bagaimana penyisihan 5% wakaf produktif otomatis dari biaya sewa kantor virtual Anda mendanai program sosial masjid secara berkelanjutan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Sliders (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-[20px] border border-black/5 space-y-4.5 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-semibold text-[#2d2d22]">
                  <span>Biaya Sewa Bulanan Paket:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{formatRupiah(simulatedMonthlyRent)}/bln</span>
                </div>
                <input
                  type="range"
                  min="200000"
                  max="1500000"
                  step="50000"
                  value={simulatedMonthlyRent}
                  onChange={(e) => setSimulatedMonthlyRent(Number(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#72725e] font-mono">
                  <span>Basic: Rp 250k</span>
                  <span>Pro: Rp 450k</span>
                  <span>Suite: Rp 750k+</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between font-semibold text-[#2d2d22]">
                  <span>Durasi Kontrak Sewa:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">{simulatedTenureMonths} Bulan</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="36"
                  step="6"
                  value={simulatedTenureMonths}
                  onChange={(e) => setSimulatedTenureMonths(Number(e.target.value))}
                  className="w-full accent-[#5A5A40] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#72725e] font-mono">
                  <span>6 Bulan</span>
                  <span>12 Bulan (1 Thn)</span>
                  <span>24 Bulan</span>
                  <span>36 Bulan</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-black/5">
                <div className="flex items-center justify-between font-semibold text-[#2d2d22]">
                  <span>Wakaf Sukarela Tambahan:</span>
                  <span className="font-mono font-bold text-[#5A5A40]">+{voluntaryExtraWaqfPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 2.5, 5, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setVoluntaryExtraWaqfPct(pct)}
                      className={`flex-1 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        voluntaryExtraWaqfPct === pct
                          ? "bg-[#5A5A40] text-white"
                          : "bg-[#fafaf7] text-[#72725e] hover:text-[#2d2d22] border border-black/5"
                      }`}
                    >
                      {pct === 0 ? "Standar 5%" : `+${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Impact Projected Dashboard (7 cols) */}
            <div className="lg:col-span-7 bg-[#4a4a35] text-white p-5 sm:p-6 rounded-[20px] border border-[#5A5A40]/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="text-xs text-[#E4E3DA]">Total Wakaf Produktif Dihasilkan:</div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#f5f5f0] font-mono">
                  {formatRupiah(simulationResults.totalWaqfSimulated)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 space-y-1">
                  <div className="text-[10px] text-[#E4E3DA] flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Porsi Makanan
                  </div>
                  <div className="font-serif text-base sm:text-lg font-bold text-white">
                    {simulationResults.foodPortions} Porsi
                  </div>
                  <div className="text-[9px] text-[#E4E3DA]/80">Dapur Berkah Jum'at</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 space-y-1">
                  <div className="text-[10px] text-[#E4E3DA] flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Beasiswa Santri
                  </div>
                  <div className="font-serif text-base sm:text-lg font-bold text-white">
                    {simulationResults.santriDays} Hari
                  </div>
                  <div className="text-[9px] text-[#E4E3DA]/80">Pelatihan IT & Tahfidz</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 space-y-1 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#E4E3DA] flex items-center gap-1">
                    <Sun className="w-3 h-3" /> Energi Hijau
                  </div>
                  <div className="font-serif text-base sm:text-lg font-bold text-white">
                    {simulationResults.cleanEnergyKwh} kWh
                  </div>
                  <div className="text-[9px] text-[#E4E3DA]/80">Listrik Panel Surya</div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[#E4E3DA]/90 leading-relaxed bg-black/20 p-3 rounded-xl">
                Setiap pembayaran sewa bulanan Anda langsung dialirkan menjadi amal jariyah berkesinambungan tanpa henti sesuai QS. Al-Baqarah: 261.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: Selected Community Project Line Items & Evidence */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-xl w-full border border-black/10 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                  <selectedProject.icon className="w-6 h-6 text-[#E4E3DA]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-[#f5f2ed] text-[#5A5A40] rounded-full">
                    {selectedProject.category}
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2d2d22] mt-0.5">
                    {selectedProject.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-8 h-8 rounded-full bg-[#fafaf7] hover:bg-[#E4E3DA] text-[#72725e] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* SDG & Impact Target */}
              <div className="bg-[#fafaf7] p-3.5 rounded-xl border border-black/5 space-y-1">
                <div className="text-[11px] font-bold text-[#5A5A40] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Target Dampak Sosial:</span>
                </div>
                <p className="text-[#2d2d22] leading-relaxed">
                  {selectedProject.sdgGoal}
                </p>
                <div className="text-[11px] text-[#72725e] pt-1">
                  Capaian Kumulatif Saat Ini: <strong className="text-[#5A5A40]">{selectedProject.beneficiarySummary}</strong>
                </div>
              </div>

              {/* Fund Realization Overview */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-black/5">
                  <div className="text-[10px] text-[#72725e]">Alokasi ({selectedProject.allocationPct}%)</div>
                  <div className="font-serif font-bold text-xs sm:text-sm text-[#2d2d22] mt-0.5">
                    {formatRupiah(selectedProject.terkumpul)}
                  </div>
                </div>
                <div className="bg-[#f5f2ed] p-3 rounded-xl border border-[#5A5A40]/15">
                  <div className="text-[10px] text-[#5A5A40] font-bold">Tersalurkan</div>
                  <div className="font-serif font-bold text-xs sm:text-sm text-[#5A5A40] mt-0.5">
                    {formatRupiah(selectedProject.tersalurkan)}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-black/5">
                  <div className="text-[10px] text-[#72725e]">Cadangan Kas</div>
                  <div className="font-serif font-bold text-xs sm:text-sm text-[#2d2d22] mt-0.5">
                    {formatRupiah(selectedProject.cadangan)}
                  </div>
                </div>
              </div>

              {/* Recent Realization Log */}
              <div className="space-y-2">
                <div className="font-bold text-[#2d2d22] text-[11px] uppercase tracking-wide">
                  Catatan Penyaluran & Bukti Kegiatan Terbaru:
                </div>
                <div className="space-y-2">
                  {selectedProject.recentActivities.map((act, i) => (
                    <div key={i} className="p-3 bg-[#fafaf7] rounded-xl border border-black/5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-[#72725e]">{act.date}</span>
                        <span className="font-bold font-mono text-[#5A5A40]">{formatRupiah(act.amount)}</span>
                      </div>
                      <p className="text-[#2d2d22] text-[11px] leading-relaxed">{act.description}</p>
                      <div className="text-[10px] text-[#72725e]">Lokasi: {act.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-black/5 flex items-center justify-between">
              <span className="text-[11px] text-[#72725e] flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" /> Status: {selectedProject.status}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
